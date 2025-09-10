import { useContext } from "react";
import { ThemeContext } from "../components/ThemeContext";
import "../styles/settings.scss";

export default function Settings() {
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <main className="settings-page">
            <h2>Настройки</h2>
            <section className="settings-group">
                <label>Тема:</label>
                <div className="theme-buttons">
                    <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>Светлая</button>
                    <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>Тёмная</button>
                    <button className={theme === "system" ? "active" : ""} onClick={() => setTheme("system")}>Системная</button>
                </div>
            </section>
        </main>
    );
}