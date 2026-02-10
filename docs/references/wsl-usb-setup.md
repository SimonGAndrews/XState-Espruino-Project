# WSL USB Setup Reference  
## Supporting Espruino Development (ESP32 / ESP32-C3 / ESP32-S3)

---

## 1. Purpose & Scope

This document describes a **known-good approach to USB device setup, usage, and troubleshooting in WSL2** specifically to support **Espruino development workflows**.

It reflects practical experience gained while building and flashing Espruino on ESP32-C3 hardware under:

- Windows 11
- WSL2 (Ubuntu 22.04)
- ESP-IDF v4.4.8
- usbipd-win

The focus is on:
- USB-Serial devices (CH340, CP210x, FTDI)
- ESP32 USB-JTAG / Serial composite devices
- Stability considerations under WSL
- Proven workarounds for flashing and development

This document complements the main workflow documentation located at:

    <TOOLCHAIN_ROOT>/docs

---

## 1.1 WSL USB Quick Checklist

- Windows: `usbipd list` shows device; `usbipd attach --wsl --busid <BUSID>`
- WSL: `lsusb` shows device
- WSL: `sudo modprobe ch341` (CH340 only) if no `/dev/ttyUSB*`
- WSL: `/dev/ttyUSB0` exists; check `ls -l /dev/ttyUSB0`
- If `crw------- root root`, use `sudo` for flashing or `sudo chmod 666 /dev/ttyUSB0`
- If group changes do not apply, `wsl --shutdown` and reopen WSL

---

## 2. Architectural Overview (WSL USB Model)

WSL2 does **not** have direct access to host USB devices.

Instead:
- USB devices are managed on Windows
- Devices are forwarded into WSL using `usbipd-win`
- A virtual USB host controller (`vhci_hcd`) appears inside WSL

Key implications:
- Device attach/detach is explicit
- udev is limited or absent
- Permissions may need manual adjustment
- USB-JTAG devices may be unstable under WSL

---

## 3. Required Windows Components

### 3.1 usbipd-win

usbipd-win must be installed on Windows.

Reference: https://learn.microsoft.com/en-us/windows/wsl/connect-usb

Verify installation:

    usbipd --version

List devices:

    usbipd list

Typical output:

    BUSID  VID:PID    DEVICE                                   STATE
    3-3    303a:1001  USB JTAG/serial debug unit               Not shared
    3-4    1a86:7523  USB-SERIAL CH340 (COM4)                  Not shared

---

## 4. Attaching USB Devices to WSL

### 4.1 Identify the Device (Windows PowerShell)

The command usbipd list lists all the USB devices connected to Windows. From an administrator command prompt on Windows, run this command.

    usbipd list

#### Example output:

Connected:
|BUSID|  VID:PID  |    DEVICE                                              |  STATE    |
|-----|---------- | -------------------------------------------------------|-----------|
|1-5  |  27c6:639c|  Goodix MOC Fingerprint                                | Not shared|
|1-6  |  0c45:6a1b|  Integrated Webcam                                     | Not shared|
|1-10 |  0bda:887b|  Realtek Bluetooth Adapter                             | Not shared|
|2-3  |  1a86:7523|  USB-SERIAL CH340 (COM4)                               | Shared    |

Persisted:
|GUID                                 | DEVICE |
|-------------------------------------|------------------------------------------------------|
|98f6bd85-54a3-4a6b-9ee2-76696b37ee9e |  USB Serial Device (COM3), USB JTAG/serial debug unit|

#### Persisted entries
In the list output, the Persisted section shows devices that usbipd has a saved entry for (by GUID), 
Persisted entries are Windows device identities, not USB ports. Think of them as “This kind of device was shared before”.

These:
 - Do NOT need to be physically connected
 - Are remembered by GUID, not BUSID
 - Represent previously shared Windows device identities
 - Are stored across reboots
 - Can block re-sharing when the device reappears

Persisted entries allows auto-reattachment — but it can cause problems with:
 - ESP32 USB-JTAG
 - CH340 / CP210x
 - Devices that re-enumerate or change interfaces

 (see 4.3 below for clean recovery of persisted devices when issues occur)

---

### 4.2 Attach a Device to WSL

The command usbipd `bind` shares a device, allowing it to be attached to WSL. This requires administrator privileges. Select the bus ID of the device you would like to use in WSL and run this command. Note that sharing a device is persistent; it survives reboots. You will have to do it only once, per device.

    usbipd bind --busid 3-4

`usbipd list` will now show the device as `shared`.

Close the administrator command prompt; further commands do not require special privileges.

Open a normal command prompt on Windows. Additionally, ensure a WSL command prompt is open; this will keep the WSL 2 lightweight VM active.

The command `usbipd attach --wsl` attaches a USB device to WSL. As long as the device is attached to WSL, it cannot be used by Windows. Once attached to WSL, you can use the device in any WSL 2 distribution. From the Windows command prompt run this command:

    usbipd attach --busid 3-4 --wsl

Attach with auto-reattach (use cautiously):

    usbipd attach --auto-attach --busid 3-4 --wsl


`usbipd list` will now show the device as `attached`.

Notes:
- Auto-attach may cause instability with JTAG devices

---

### 4.3 Detach a Device

On Windows (PowerShell):

If needed:

    usbipd detach --busid 3-4

To remove a persisted device, use the GUID shown under Persisted:

    usbipd unbind --guid <GUID>

When to unbind vs detach (important distinction)
|Command|	Use when                           |
|-------|--------------------------------------|
|detach	| Device is currently attached to WSL
|unbind	| You want to forget the device completely

---

### 4.3 Clean recovery sequence (recommended for ESP32 / JTAG)

This is the safest reset sequence when things get weird:

    wsl --shutdown
    usbipd unbind --guid <GUID>
    net stop usbipd
    net start usbipd

Then 
   - Unplug the USB device - Wait 3–5 seconds - Plug it back in
   - Verify the device is visible and unshared - >usbipd list  (powershell)
   - Bind the device (export it) - >usbipd bind --busid <id eg 1-8>      (powershell)
   - reopen vscode for WSL (Restarts WSL)
   - Attach the device to WSL - >usbipd attach --wsl --busid <id eg 1-8>   (PowerShell)
   - Verify inside WSL - >lsusb (vscode terminal)

## 5. Verifying USB Devices Inside WSL

### 5.1 List USB Devices

Inside WSL:

    lsusb

Example output:

    Bus 001 Device 006: ID 1a86:7523 QinHeng Electronics CH340 serial converter
    Bus 001 Device 007: ID 303a:1001 Espressif USB JTAG/serial debug unit

---

### 5.2 Check Kernel Messages

    dmesg | tail -n 50

Look for:
- USB device attach
- Serial driver binding (e.g. ch341, cp210x)
- tty device assignment

If the device is visible in `lsusb` but no `ttyUSB*` appears, load the driver manually:

    sudo modprobe ch341

This loads the ch341 kernel module (USB‑serial driver for CH340/CH341 chips). With sudo, it requests the kernel to load the driver so the device can show up as /dev/ttyUSB*. If it’s already loaded, it’s a no‑op.

---

### 5.3 Check Serial Device Nodes

    ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null

Typical result for CH340:

    /dev/ttyUSB0

USB-JTAG devices may **not** create tty nodes reliably.

---

## 6. Serial Port Permissions (WSL Reality)

WSL may not run a full `udevd`. As a result:

- udev rules may not reload
- Serial permissions may default to root-only

See also: https://learn.microsoft.com/en-us/windows/wsl/systemd

### 6.1 Check Permissions

    ls -l /dev/ttyUSB0

Expected:

    crw-rw---- root dialout ...

### 6.2 Fix Permissions Manually

    sudo chgrp dialout /dev/ttyUSB0
    sudo chmod 660 /dev/ttyUSB0

These commands set the device group to dialout and permissions to rw-rw----:
- sudo chgrp dialout /dev/ttyUSB0 sets the group owner to dialout.
- sudo chmod 660 /dev/ttyUSB0 allows read/write for owner and group only.
Any user in dialout can access the device, and others cannot. This is safer than 666.

If the node is still owned by `root:root` with `crw-------`, use one of:

    sudo chmod 666 /dev/ttyUSB0

This sets permissions on /dev/ttyUSB0 to world-read/write (rw-rw-rw-), so any user can open the serial device without being in dialout. It is temporary (lost on unplug/reboot) and not ideal for security; adding the user to dialout is the usual approach.

or run flashing commands with `sudo`.

### 6.3 Verify Group Membership

    groups | tr ' ' '\n' | grep -x dialout

If the user has sufficient rights for USB flashing (typically being in the dialout group), the command should output:

    dialout

If they are not in the group, it prints nothing and exits with status 1.

If group changes do not take effect in the current shell, restart WSL:

    wsl --shutdown

---

## 7. Common Debugging Commands (WSL Side)

### 7.1 USB Bus Presence

    ls -l /dev/bus/usb

This lists the USB device nodes under /dev/bus/usb with details (permissions, owner/group, size, timestamp), one per line. Useful for checking which USB devices are present and what access rights they have.

### 7.2 Kernel USB Stack

    lsmod | grep usb

    lsmod | grep vhci

These check loaded kernel modules:
   - lsmod | grep usb shows any currently loaded modules with “usb” in the name (USB core, host controllers, drivers).
   - lsmod | grep vhci shows whether the Virtual Host Controller Interface module is loaded (used by USB/IP and similar virtualization features).
  
If there’s no output, that module isn’t loaded.

### 7.3 Device Re-enumeration

Unplug/replug a USB device, then in WSL:

    dmesg | tail -n 80

This forces the USB device to re-enumerate and then `dmesg` checks the kernel log for what happened. `dmesg | tail -n 80` shows the latest log lines so you can verify the device was detected, which driver bound, and what device node it got. This helps confirm WSL sees the device and which node it is assigned to for flashing.

The key lines that show the device re-enumeration and the assigned serial node (e.g., ttyUSB0) are:

When it disconnects:

```bash
usb 1-1: USB disconnect, device number 4
ch341-uart ttyUSB0: ch341-uart converter now disconnected from ttyUSB0
ch341 1-1:1.0: device disconnected
```

After `usbipd attach --wsl --busid <BUSID>` in PowerShell it reconnects:

```bash
usb 1-1: new full-speed USB device number X using vhci_hcd (device detected/enumerated)
ch341 1-1:1.0: ch341-uart converter detected (driver match)
usb 1-1: ch341-uart converter now attached to ttyUSB0 (device node assigned)
```

---

## 8. Known Failure Modes & Diagnostics

### 8.1 Device Visible in Windows but Not in WSL

Checks:
- Device must be attached via usbipd
- Verify `usbipd list` shows state = Attached
- Reattach if necessary

---

### 8.2 Device Appears in lsusb but No /dev/ttyUSB*

Likely causes:
- USB-JTAG composite device
- Driver binding issues
- Serial interface not exposed

Workaround:
- Use external USB-Serial (CH340 / CP210x)
- Or ESP-PROG

---

### 8.3 Device Repeatedly Attaches/Detaches

Seen with:
- USB-JTAG interfaces
- Auto-attach mode
- Heavy traffic (OpenOCD, idf.py monitor)

Recommendation:
- Avoid auto-attach for JTAG
- Prefer manual attach
- Use stable USB-Serial for flashing

---

## 9. Proven Flashing Strategy Under WSL

### 9.1 Do Not Rely on USB-JTAG for Flashing

Experience shows:
- ESP32 USB-JTAG is unstable under WSL
- tty device may not appear
- esptool connection may fail mid-flash

### 9.2 Recommended Flashing Interfaces

Preferred:
- CH340 / CP210x USB-Serial
- ESP-PROG USB-Serial channel

Avoid (for flashing under WSL):
- Native ESP32 USB-JTAG interface
---

## 10. Summary

This document captures a **stable, experience-based USB strategy** for Espruino development under WSL:

- usbipd-win is required and effective
- USB-Serial is reliable
- USB-JTAG is fragile under WSL
- Direct esptool.py flashing is robust
- Manual permission fixes are normal

Used together with the main Espruino workflow README, this provides a complete and repeatable development environment.

---

## Appendix A – USB-JTAG Issues (ESP32-C3 / ESP32-S3)

### A.1 Symptoms Observed

- USB-JTAG device attaches in Windows
- Appears in lsusb in WSL
- No /dev/ttyACM* or /dev/ttyUSB* created
- Repeated connect/disconnect messages in dmesg
- idf.py / esptool unable to open port
- VS Code terminal crashes during JTAG operations

### A.2 Root Causes

- Composite USB device (JTAG + CDC)
- Partial driver support under vhci_hcd
- Timing-sensitive reset/boot sequences
- WSL USB virtualization limitations

### A.3 Workarounds (Validated)

1. **Use External USB-Serial for Flashing**
   - CH340, CP210x, FTDI
   - Stable /dev/ttyUSB0

2. **Use ESP-PROG**
   - USB-Serial for flashing
   - JTAG only when required
   - Prefer flashing via serial, not JTAG

3. **Avoid idf.py flash**
   - Use esptool.py directly
   - Matches Espruino build output
   - Avoids CMake/target confusion

4. **Separate Concerns**
   - Serial for flashing + REPL
   - JTAG only for debugging (future work)

### A.4 Recommended Practice (Espruino)

For ESP32-C3 / ESP32-S3 under WSL:

- Flash via USB-Serial
- Monitor via USB-Serial
- Defer USB-JTAG usage unless strictly required
- Expect better JTAG stability on native Linux

---

## Appendix B – Notes from usbipd-win WSL Support

Reference: https://github.com/dorssel/usbipd-win/wiki/WSL-support

- `usbipd bind` is an admin-only, one-time share; `usbipd attach --wsl` is per-session and can run without admin.
- Devices detach on unplug or WSL restart; expect to reattach after `wsl --shutdown`.
- Keep a WSL shell open during attach so the WSL2 VM stays active.
- Recent WSL kernels (5.10.60.1+) include common USB-serial drivers; `wsl --update` is the first step if drivers are missing.
- udev rules must be in place before attaching; reload with `sudo udevadm control --reload` or `sudo service udev restart` if needed.
- Custom WSL kernel builds are only needed for special drivers; see the wiki for the full kernel configuration path.
