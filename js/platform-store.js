const key = "main-window-snapshot";
export function getSnapShot() {
    const storedSnapshot = localStorage.getItem(key);
    if (storedSnapshot) {
        return JSON.parse(storedSnapshot);
    }
    return null;
}

export async function saveSnapShot() {
    const snapshot = await fin.Platform.getCurrentSync().getSnapshot();
    localStorage.setItem(key, JSON.stringify(snapshot));
}

export function clearSnapShot() {
    localStorage.removeItem(key);
}
