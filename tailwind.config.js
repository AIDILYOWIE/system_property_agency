import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "Geist", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Chris Property Signature Design Tokens
                primary: {
                    DEFAULT: "#0A5F41",
                    hover: "#074831",
                    light: "#E6F0EC",
                    50: "#E6F0EC",
                    100: "#C0D9CE",
                    200: "#96C0B0",
                    300: "#6CA792",
                    400: "#4D9279",
                    500: "#0A5F41",
                    600: "#085538",
                    700: "#074831",
                    800: "#053B27",
                    900: "#032E1E",
                },
                // status / chart colors
                status: {
                    rented: "#003620",
                    sold: "#145D40",
                    available: "#52A77A",
                    draft: "#D1D5DB",
                    projected: "#D1D5DB",
                },
                surface: "#FFFFFF",
                canvas: "#FAFAFA",
                "text-primary": "#000000",
                "text-secondary": "#717171",
                "text-muted": "#9CA3AF",
                "border-base": "#E5E7EB",
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                info: "#3B82F6",
                background: "#FAFAFA", // canvas
                foreground: "#000000", // text-primary
                border: "#E5E7EB", // border-base
                input: "#E5E7EB", // border-base
                ring: "#0A5F41", // primary
                muted: {
                    DEFAULT: "#F3F4F6",
                    foreground: "#9CA3AF",
                },
                accent: {
                    DEFAULT: "#F3F4F6",
                    foreground: "#000000",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#000000",
                },
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#000000",
                },
                destructive: {
                    DEFAULT: "#EF4444",
                    foreground: "#FFFFFF",
                },
            },
            backgroundImage: {
                "projected-pattern":
                    "repeating-linear-gradient(-45deg, transparent, transparent 4px, #D1D5DB 4px, #D1D5DB 6px)",
                "draft-pattern":
                    "repeating-linear-gradient(-45deg, transparent, transparent 1px, #D1D5DB 1px, #D1D5DB 2px)",
            },
            borderRadius: {
                sm: "6px",
                DEFAULT: "8px",
                md: "8px",
                lg: "12px",
                xl: "16px",
                "2xl": "20px",
                full: "9999px",
            },
            boxShadow: {
                card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
                dropdown: "0 4px 16px 0 rgba(0,0,0,0.08)",
                sidebar: "1px 0 0 0 #E5E7EB",
                // Forbidden: heavy dark shadows
            },
            fontSize: {
                h1: [
                    "2rem",
                    {
                        lineHeight: "1.2",
                        letterSpacing: "-0.02em",
                        fontWeight: "700",
                    },
                ],
                h2: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
                body: ["0.875rem", { lineHeight: "1.5" }],
                label: ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
            },
            spacing: {
                4.5: "1.125rem",
                13: "3.25rem",
                15: "3.75rem",
                18: "4.5rem",
                22: "5.5rem",
                68: "17rem",
                72: "18rem",
                76: "19rem",
                80: "20rem",
            },
            transitionDuration: {
                200: "200ms",
                250: "250ms",
            },
            zIndex: {
                sidebar: "20",
                header: "30",
                modal: "50",
                tooltip: "60",
            },
        },
    },

    plugins: [forms],
};
