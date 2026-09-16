const DRAWER_PULSE_COMMAND = new Uint8Array([
    0x1b,
    0x70,
    0x00,
    0x19,
    0xfa,
]);

export async function triggerPhysicalDrawer({ baudRate = 9600 } = {}) {
    if (!('serial' in navigator)) {
        throw new Error('Web Serial API tidak didukung oleh browser ini.');
    }

    const port = await navigator.serial.requestPort();

    try {
        await port.open({ baudRate });

        const writer = port.writable?.getWriter();

        if (!writer) {
            throw new Error('Thermal printer tidak dapat menerima data.');
        }

        try {
            await writer.write(DRAWER_PULSE_COMMAND);
        } finally {
            writer.releaseLock();
        }
    } finally {
        if (port.readable || port.writable) {
            await port.close();
        }
    }
}
