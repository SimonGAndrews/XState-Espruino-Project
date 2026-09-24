# Xstate-fsm-c Native Format Version 1

## Status

- Status: Provisional physical layout for the first vertical slice
- Arena format version: 1
- Public API status: Private implementation format

This appendix defines the physical native representation required by the
Xstate-fsm-c Profile 1 specification. It is normative for the Version 1 C
implementation but is not part of the public JavaScript API.

The first vertical slice MUST measure this layout before it is frozen. Any
revision made before that review MUST update this appendix and its compile-time
assertions. After the format is declared frozen, an incompatible physical
change MUST increment the arena format version.

## Common Types

All indexes and record counts use 16-bit unsigned integers. All arena offsets,
sizes, and hashes use 32-bit unsigned integers.

```c
#include <stddef.h>
#include <stdint.h>

typedef uint16_t XfcIndex;

#define XFC_INDEX_NONE UINT16_C(0xFFFF)

typedef struct {
  uint16_t first;
  uint16_t count;
} XfcRange;

typedef struct {
  uint32_t offset;
  uint16_t count;
  uint16_t record_size;
} XfcTableRef;
```

Valid indexes range from zero through 65534. An empty range MUST use
`first == XFC_INDEX_NONE` and `count == 0`. A non-empty range MUST have a valid
first index, and its checked 32-bit `first + count` value MUST not exceed the
referenced table count.

## Byte Order and Alignment

Version 1 arenas use the compiling target's native byte order. Exactly one of
the header's little-endian or big-endian flags MUST be set, and a reader MUST
reject an arena whose byte order differs from the running firmware.

The header and every record table MUST begin at an offset divisible by four.
Padding bytes MUST be zero. The string pool is byte-aligned but follows a
four-byte-aligned table boundary. Implementations MUST use the structures below
with natural alignment and MUST NOT use packed-structure compiler extensions.

## Header

The arena begins with this 96-byte header:

```c
enum {
  XFC_TABLE_STATE = 0,
  XFC_TABLE_SYMBOL,
  XFC_TABLE_HANDLER,
  XFC_TABLE_TRANSITION,
  XFC_TABLE_GUARD,
  XFC_TABLE_ACTION,
  XFC_TABLE_ASSIGNMENT,
  XFC_TABLE_ASSIGNMENT_ENTRY,
  XFC_TABLE_COUNT
};

enum {
  XFC_ARENA_LITTLE_ENDIAN = UINT32_C(0x00000001),
  XFC_ARENA_BIG_ENDIAN    = UINT32_C(0x00000002),
  XFC_ARENA_KNOWN_FLAGS   = UINT32_C(0x00000003)
};

enum {
  XFC_CONTEXT_OMITTED = 0,
  XFC_CONTEXT_LITERAL = 1,
  XFC_CONTEXT_FACTORY = 2
};

typedef struct {
  uint8_t magic[4];             /* 'X', 'F', 'C', 'M' */
  uint16_t format_version;      /* 1 */
  uint16_t header_size;         /* 96 */
  uint32_t arena_size;
  uint32_t flags;
  uint16_t root_state;
  uint16_t context_slot;
  uint16_t retained_count;
  uint8_t context_kind;
  uint8_t reserved;
  uint32_t string_offset;
  uint32_t string_size;
  XfcTableRef tables[XFC_TABLE_COUNT];
} XfcArenaHeader;
```

`context_slot` MUST be `XFC_INDEX_NONE` when context is omitted and MUST name a
retained-value slot for literal or factory context. `reserved` and all unknown
header flag bits MUST be zero. `root_state` MUST identify the single root state
record.

## Record Layouts

### State Record

```c
enum {
  XFC_STATE_ATOMIC   = UINT16_C(0x0000),
  XFC_STATE_COMPOUND = UINT16_C(0x0001),
  XFC_STATE_FINAL    = UINT16_C(0x0002),
  XFC_STATE_TYPE_MASK = UINT16_C(0x0003),
  XFC_STATE_ROOT     = UINT16_C(0x0004),
  XFC_STATE_KNOWN_FLAGS = UINT16_C(0x0007)
};

typedef struct {
  uint16_t parent;
  uint16_t initial;
  uint16_t key_symbol;
  uint16_t completion_event_symbol;
  XfcRange handlers;
  XfcRange completion_transitions;
  XfcRange initial_actions;
  XfcRange entry_actions;
  XfcRange exit_actions;
  uint16_t flags;
  uint8_t depth;
  uint8_t reserved;
} XfcStateRecord;
```

The record size is 32 bytes. The root has `parent` and `key_symbol` set to
`XFC_INDEX_NONE`, depth zero, and the root flag set. Other states name their
exact key symbol and parent. Atomic and final states have no initial state or
initial-action range. `completion_event_symbol` is required for a non-root
compound state and is otherwise `XFC_INDEX_NONE`. Unknown state flags and the
reserved byte MUST be zero.

### Symbol Record

```c
enum {
  XFC_SYMBOL_STATE_KEY       = UINT16_C(0x0001),
  XFC_SYMBOL_EVENT           = UINT16_C(0x0002),
  XFC_SYMBOL_ACTION          = UINT16_C(0x0004),
  XFC_SYMBOL_GUARD           = UINT16_C(0x0008),
  XFC_SYMBOL_CONTEXT_KEY     = UINT16_C(0x0010),
  XFC_SYMBOL_COMPLETION_EVENT = UINT16_C(0x0020),
  XFC_SYMBOL_KNOWN_FLAGS     = UINT16_C(0x003F)
};

typedef struct {
  uint32_t hash;
  uint32_t string_offset;
  uint16_t byte_length;
  uint16_t flags;
} XfcSymbolRecord;
```

The record size is 12 bytes. `hash` is 32-bit FNV-1a over exactly
`byte_length` bytes. A symbol may combine role flags. Its string range MUST lie
within the string pool. Equal byte strings MUST use one interned symbol record
where practical.

### Handler Record

```c
enum {
  XFC_HANDLER_WILDCARD = UINT16_C(0x0001),
  XFC_HANDLER_KNOWN_FLAGS = UINT16_C(0x0001)
};

typedef struct {
  uint16_t event_symbol;
  XfcRange transitions;
  uint16_t flags;
} XfcHandlerRecord;
```

The record size is 8 bytes. A wildcard handler sets the wildcard flag and uses
`XFC_INDEX_NONE` for `event_symbol`. An exact handler clears the flag and names
an event symbol. Its transition range MUST be non-empty.

### Transition Record

```c
enum {
  XFC_TRANSITION_REENTER = UINT16_C(0x0001),
  XFC_TRANSITION_KNOWN_FLAGS = UINT16_C(0x0001)
};

typedef struct {
  uint16_t target_state;
  uint16_t guard;
  XfcRange actions;
  uint16_t flags;
  uint16_t reserved;
} XfcTransitionRecord;
```

The record size is 12 bytes. `target_state == XFC_INDEX_NONE` represents a
targetless transition, and `guard == XFC_INDEX_NONE` represents an unguarded
candidate. The reserved field and unknown flags MUST be zero.

### Guard Record

```c
typedef struct {
  uint16_t retained_slot;
  uint16_t flags;
} XfcGuardRecord;
```

The record size is 4 bytes. Version 1 defines no guard flags, so `flags` MUST be
zero. `retained_slot` MUST identify a callable retained value.

### Action Record

```c
enum {
  XFC_ACTION_USER = 0,
  XFC_ACTION_ASSIGN = 1
};

typedef struct {
  uint16_t kind;
  uint16_t reference;
  uint16_t flags;
  uint16_t reserved;
} XfcActionRecord;
```

The record size is 8 bytes. A user action's `reference` names a callable
retained-value slot. An assignment action's `reference` names an assignment
record. Version 1 defines no action flags; `flags` and `reserved` MUST be zero.

### Assignment Record

```c
enum {
  XFC_ASSIGN_PARTIAL = 0,
  XFC_ASSIGN_PROPERTY_MAP = 1
};

typedef struct {
  uint16_t kind;
  uint16_t retained_slot;
  XfcRange entries;
  uint16_t flags;
  uint16_t reserved;
} XfcAssignmentRecord;
```

The record size is 12 bytes. A partial assigner names its callable retained
slot and has an empty entry range. A property map uses
`retained_slot == XFC_INDEX_NONE` and names its ordered assignment-entry range.
Version 1 defines no assignment flags; `flags` and `reserved` MUST be zero.

### Assignment Entry Record

```c
enum {
  XFC_ASSIGN_ENTRY_LITERAL = UINT16_C(0x0000),
  XFC_ASSIGN_ENTRY_EXPRESSION = UINT16_C(0x0001),
  XFC_ASSIGN_ENTRY_KNOWN_FLAGS = UINT16_C(0x0001)
};

typedef struct {
  uint16_t key_symbol;
  uint16_t retained_slot;
  uint16_t flags;
  uint16_t reserved;
} XfcAssignmentEntryRecord;
```

The record size is 8 bytes. An expression slot MUST be callable. A literal slot
may contain any JavaScript value. Version 1 retains primitive fixed values as
well as object values; it does not encode JavaScript primitive variants in the
arena. Unknown flags and `reserved` MUST be zero.

## String Pool

The string pool contains exact, unnormalised bytes. Strings are not
null-terminated. A symbol is identified by its offset and byte length, so zero
bytes in a supported Espruino string do not terminate comparison. Construction
MUST intern repeated symbol bytes where practical and MUST calculate the pool
size using checked 32-bit arithmetic.

The string pool begins at `string_offset` and occupies exactly `string_size`
bytes. The checked sum MUST not exceed `arena_size`.

## Retained JavaScript Values

The retained-value container is a GC-visible JavaScript child of the machine
object and is not part of the flat-string arena. Its entries use dense numeric
slots from zero through `retained_count - 1`. Native records and the header may
refer to those entries only by `uint16_t` slot index; they MUST NOT store a
`JsVar *` or `JsVarRef`.

Repeated references to the same compiled named implementation MUST reuse its
slot. Version 1 retains every fixed assignment value, including primitives.
This intentionally favours a simple and reliable first implementation; the
vertical-slice measurements MUST report its variable-block cost.

## Arena Order and Size

The physical order is:

1. 96-byte header;
2. state records;
3. symbol records;
4. handler records;
5. transition records;
6. guard records;
7. action records;
8. assignment records;
9. assignment-entry records; and
10. string pool.

Before every non-empty table, the current size is rounded up to a multiple of
four and zero padding is emitted. An empty table has offset zero, count zero,
and its defined non-zero `record_size`. The string offset is the four-byte
aligned end of the final table even when the string pool is empty.

Every multiplication, addition, and alignment operation MUST use checked
arithmetic. The resulting size MUST equal `header.arena_size` and satisfy the
limits in the main specification before the flat string is allocated.

## Per-Actor Native Block

Each actor owns a separate 16-byte native block backed by an Espruino flat
string held as a hidden child of the actor object. It is garbage-collector
owned and requires no separate native allocation or destructor:

```c
enum {
  XFC_ACTOR_NOT_STARTED = 0,
  XFC_ACTOR_ACTIVE = 1,
  XFC_ACTOR_DONE = 2,
  XFC_ACTOR_STOPPED = 3,
  XFC_ACTOR_ERROR = 4
};

enum {
  XFC_OPERATION_IDLE = 0,
  XFC_OPERATION_START = 1,
  XFC_OPERATION_SEND = 2,
  XFC_OPERATION_STOP = 3,
  XFC_OPERATION_NOTIFY = 4
};

typedef struct {
  uint8_t magic[4];             /* 'X', 'F', 'C', 'A' */
  uint16_t format_version;      /* 1 */
  uint8_t status;
  uint8_t operation;
  uint16_t leaf_state;
  uint16_t microsteps;
  uint16_t flags;
  uint16_t reserved;
} XfcActorData;
```

Version 1 defines no actor flags, so `flags` and `reserved` MUST always be zero.
`leaf_state` is `XFC_INDEX_NONE` before startup. It may retain the last stable
or terminal leaf for diagnostic snapshots after completion, stop, or failure.
`microsteps` MUST be reset when a public operation begins. After all normal or
fault cleanup, `operation` MUST be `XFC_OPERATION_IDLE` and `microsteps` MUST be
zero.

The actor object separately owns hidden GC-visible children for its compiled
machine, current context, cached snapshot, retained error, native block, and
subscription storage. Temporary locked references used during synchronous
notification MUST NOT be retained as native pointers after the call returns.

## Validation

`createActor(...)` MUST validate the compiled machine and arena at least as
follows:

- machine private brand and arena magic bytes;
- format versions and header size;
- byte-order flags and unknown flag bits;
- arena size against the actual flat-string byte length;
- table order, alignment, exact record sizes, bounds, and non-overlap;
- string-pool bounds;
- root-state invariants;
- every index, retained slot, and record range;
- every record kind and known flag mask; and
- all required zero-valued reserved fields.

Actor creation MUST initialise the actor magic, format version, and zero-valued
reserved fields. Every public actor method MUST validate that actor header
before using the rest of the block.

Construction MUST produce these invariants. Runtime dispatch may trust indexes
after successful validation and need not repeat full table validation for every
event. Any later detected inconsistency MUST stop before unsafe access and use
the `E_INTERNAL` runtime diagnostic.

## Compile-Time Assertions

The implementation MUST contain compile-time assertions equivalent to:

```c
_Static_assert(sizeof(XfcRange) == 4, "XfcRange size");
_Static_assert(sizeof(XfcTableRef) == 8, "XfcTableRef size");
_Static_assert(sizeof(XfcArenaHeader) == 96, "XfcArenaHeader size");
_Static_assert(sizeof(XfcStateRecord) == 32, "XfcStateRecord size");
_Static_assert(sizeof(XfcSymbolRecord) == 12, "XfcSymbolRecord size");
_Static_assert(sizeof(XfcHandlerRecord) == 8, "XfcHandlerRecord size");
_Static_assert(sizeof(XfcTransitionRecord) == 12,
               "XfcTransitionRecord size");
_Static_assert(sizeof(XfcGuardRecord) == 4, "XfcGuardRecord size");
_Static_assert(sizeof(XfcActionRecord) == 8, "XfcActionRecord size");
_Static_assert(sizeof(XfcAssignmentRecord) == 12,
               "XfcAssignmentRecord size");
_Static_assert(sizeof(XfcAssignmentEntryRecord) == 8,
               "XfcAssignmentEntryRecord size");
_Static_assert(sizeof(XfcActorData) == 16, "XfcActorData size");
_Static_assert(offsetof(XfcArenaHeader, tables) == 32,
               "XfcArenaHeader table offset");
```

Equivalent assertions MUST be provided when the selected C language level does
not support `_Static_assert`.

## Conformance Evidence

Native-format tests MUST include:

- an empty atomic-root machine;
- nested compound and final states;
- exact and wildcard handlers with guarded candidate arrays;
- entry, exit, transition, initial-transition, and assignment actions;
- each initial-context kind;
- maximum and empty record ranges;
- FNV-1a collision confirmation by byte comparison;
- rejection of bad magic, version, endianness, sizes, offsets, indexes, flags,
  and reserved fields; and
- a golden decoded arena report for representative little-endian builds.

Golden tests MUST compare decoded field values rather than raw compiler object
files. Raw arenas are private and are not promised to remain compatible before
the Version 1 format-freeze review.
