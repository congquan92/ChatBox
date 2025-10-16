const TZ_VN = `${import.meta.env.VITE_TZ}`;

// --- Parse gọn: nhận ISO (có Z/+hh:mm) & MySQL DATETIME (giờ VN)
export function parseVN(input?: string | number | Date | null): Date | null {
    if (!input) return null;
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
    if (typeof input === "number") return new Date(input);

    const s = String(input).trim();

    // ISO có offset hoặc Z -> dùng trực tiếp
    if (/^\d{4}-\d{2}-\d{2}T/.test(s) && /([zZ]|[+\-]\d{2}:\d{2})$/.test(s)) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }

    // MySQL DATETIME (không offset) -> coi là giờ VN
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/);
    if (m) return new Date(`${m[1]}T${m[2]}+07:00`);

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

// key YYYY-MM-DD theo giờ VN (để so sánh Today/Yesterday)
function dayKeyVN(d: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ_VN,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(d);
}

// Nếu là hôm nay -> HH:mm, ngược lại -> dd/MM/yyyy (theo VN)
export function formatTimeISO(raw?: string | number | Date | null) {
    const d = parseVN(raw);
    if (!d) return "";
    const today = new Date();
    const isToday = dayKeyVN(d) === dayKeyVN(today);

    return isToday
        ? d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: TZ_VN,
          })
        : d.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: TZ_VN,
          });
}

// HH:mm (chat)
export function formatTimeChat(raw: string | number | Date) {
    const d = parseVN(raw);
    if (!d) return "";
    return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TZ_VN,
    });
}

// So sánh cùng ngày theo VN
export function isSameDay(a: string | number | Date, b: string | number | Date) {
    const da = parseVN(a),
        db = parseVN(b);
    if (!da || !db) return false;
    return dayKeyVN(da) === dayKeyVN(db);
}

// Hôm nay / Hôm qua / dd/MM/yyyy (theo VN)
export function dayLabel(raw: string | number | Date) {
    const d = parseVN(raw);
    if (!d) return "";

    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const k = dayKeyVN(d),
        kt = dayKeyVN(today),
        ky = dayKeyVN(yesterday);

    if (k === kt) return "Hôm nay";
    if (k === ky) return "Hôm qua";

    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: TZ_VN,
    });
}
