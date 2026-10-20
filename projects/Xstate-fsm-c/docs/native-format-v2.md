# Xstate-fsm-c Native Format Version 2

## Status

- Status: Experimental shallow-history physical layout
- Arena format version: 2
- Public API status: Private implementation format
- Applicable branch: `experiment/xfsm-history`

This appendix defines the private native-format changes used by the
[shallow-history extension](extensions/shallow-history.md). It is normative
for an implementation claiming conformance to that extension. It does not
change or replace the frozen [Profile 1 Format Version 1](native-format-v1.md).

Except for the changes below, Version 2 uses the Version 1 types, record
layouts, byte-order rules, alignment, string pool, retained JavaScript values,
checked arithmetic, and validation rules.

## Arena Header

Version 2 appends one table reference to the Version 1 table list:

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
  XFC_TABLE_HISTORY,
  XFC_TABLE_COUNT
};
```

The header is therefore 104 bytes. `format_version` MUST be 2 and
`header_size` MUST be 104. The field offsets before `tables` are unchanged,
and `tables` still begins at byte offset 32.

The physical arena order is the 104-byte header, the eight Version 1 record
tables, the history table, and the string pool. Empty tables retain the Version
1 representation: offset zero, count zero, and the defined nonzero record
size.

## History State

Version 2 assigns the remaining two-bit state type to history nodes:

```c
enum {
  XFC_STATE_ATOMIC   = UINT16_C(0x0000),
  XFC_STATE_COMPOUND = UINT16_C(0x0001),
  XFC_STATE_FINAL    = UINT16_C(0x0002),
  XFC_STATE_HISTORY  = UINT16_C(0x0003),
  XFC_STATE_TYPE_MASK = UINT16_C(0x0003),
  XFC_STATE_ROOT     = UINT16_C(0x0004),
  XFC_STATE_KNOWN_FLAGS = UINT16_C(0x0007)
};
```

A history node uses the unchanged 32-byte `XfcStateRecord`. It MUST be a
non-root direct child of its history owner. Its `initial`, completion event,
handler, completion-transition, initial-action, entry-action, and exit-action
fields MUST all be empty. It retains its local key symbol, parent, and depth so
normal compile-time target resolution can name it.

A compound state's normal `initial` field MUST NOT name a history node.

## History Record

The history table contains one eight-byte record for each history-enabled
owner:

```c
typedef struct {
  uint16_t owner_state;
  uint16_t history_state;
  uint16_t fallback_state;
  uint16_t reserved;
} XfcHistoryRecord;
```

`owner_state` MUST name a non-root compound state. `history_state` MUST name
its direct `XFC_STATE_HISTORY` child. `fallback_state` is
`XFC_INDEX_NONE` or one immediate non-history child of the owner. `reserved`
MUST be zero.

Records are ordered by increasing owner-state index. Because state records are
indexed in parent order, their history-state indexes also increase. The
runtime may therefore use bounded binary lookup by either owner or history
state. There MUST be no more than one record for an owner.

A transition may retain a history node as its compiled target. Its transition
domain remains the statically compiled domain between its source and that
node. The source MUST be outside the history owner's subtree.

## Per-Actor Data

The fixed actor header remains 16 bytes, but Version 2 gives `flags` one
defined bit:

```c
enum {
  XFC_ACTOR_HISTORY_BANK_1 = UINT16_C(0x0001),
  XFC_ACTOR_KNOWN_FLAGS = UINT16_C(0x0001)
};
```

If the machine has `H` history records, its actor flat string has this layout:

| Offset | Size | Content |
| --- | --- | --- |
| 0 | 16 bytes | `XfcActorData` header |
| 16 | `2 * H` bytes | history bank 0 |
| `16 + 2 * H` | `2 * H` bytes | history bank 1 |

The exact actor-data size is therefore `16 + 4 * H` bytes. Each bank entry is
one native-order 16-bit state index. `XFC_INDEX_NONE` means that owner has no
recorded history. A non-empty entry stores the last active leaf below that
owner; the runtime derives the owner's immediate child when shallow history is
restored.

The flag selects the committed bank. At the start of a public actor operation,
the runtime copies that bank to the other bank. History changes are written to
the other bank. The operation commit point flips the flag; a fault leaves it
unchanged. This makes history publication transactional with state and context
without allocating during dispatch.

`stop()` may copy and commit an unchanged bank, but it MUST NOT record states
while executing lifecycle exit actions.

## Validation

In addition to all Version 1 checks, Version 2 validation MUST reject:

- a Version 1 header or any unknown format version;
- a history table with the wrong record size, order, bounds, or count;
- a root history state or a history state with executable behaviour;
- a history record whose owner and node relationship is inconsistent;
- duplicate or non-increasing owner records;
- an invalid or non-immediate fallback state;
- a compound initial target that names a history node;
- an inside-owner transition targeting that owner's history node;
- unknown actor flag bits, a wrong actor-data length, or an out-of-range stored
  history state; and
- nonzero reserved fields.

All record reads and writes MUST continue to use alignment-safe copies. Actor
size calculation MUST use checked arithmetic before its GC-owned flat string is
allocated.

## Compile-Time Assertions

The implementation MUST add or update assertions equivalent to:

```c
_Static_assert(sizeof(XfcArenaHeader) == 104, "XfcArenaHeader size");
_Static_assert(sizeof(XfcHistoryRecord) == 8, "XfcHistoryRecord size");
_Static_assert(sizeof(XfcActorData) == 16, "XfcActorData header size");
_Static_assert(offsetof(XfcArenaHeader, tables) == 32,
               "XfcArenaHeader table offset");
_Static_assert(offsetof(XfcHistoryRecord, fallback_state) == 4,
               "XfcHistoryRecord fallback offset");
```

The Version 1 record-size assertions remain applicable.

## Conformance Evidence

`XFC-HIST-FORMAT-001` MUST include a valid hand-built Version 2 history arena,
exact header and table layout checks, actor-size and two-bank checks, and
sanitizer-backed rejection of corrupt owner, history-node, fallback, flag,
range, index, and reserved values.

The shallow-history candidate has completed its target resource measurements
and acceptance review. Format Version 2 remains experimental with the extension
until a separate decision promotes the extension into a public profile.
