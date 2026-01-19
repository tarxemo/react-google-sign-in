import React, { useCallback, useEffect, useRef, useState } from 'react';

// Simple singleton guard to avoid re-initializing Google twice across pages
let gsiInitialized = false;
const GSI_SCRIPT_ID = 'google-identity-script';

export type GoogleSignInProps = {
    clientId: string;
    onCredential: (idToken: string) => Promise<void> | void;
    render?: boolean; // allow hiding the button while still enabling One Tap prompt
    buttonOptions?: any;
    autoPrompt?: boolean;
    scriptId?: string;
    onError?: (error: Error) => void;
    onLoad?: () => void;
};

const defaultButtonOptions: any = {
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
};

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({
    clientId,
    onCredential,
    render = true,
    buttonOptions,
    autoPrompt = true,
    scriptId = GSI_SCRIPT_ID,
    onError,
    onLoad
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [ready, setReady] = useState(false);
    const promptCalled = useRef(false);

    const initGsi = useCallback(() => {
        const google = (window as any).google;
        if (!google?.accounts?.id || !clientId) return;

        if (!gsiInitialized) {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: any) => {
                    try {
                        const idToken = response?.credential;
                        if (idToken) await onCredential(idToken);
                    } catch (error) {
                        if (onError) onError(error as Error);
                    }
                },
                auto_select: false,
                ux_mode: 'popup',
            });
            gsiInitialized = true;
        }

        // Render the button if asked to
        if (render && containerRef.current) {
            // Clear previous contents to avoid duplicate buttons on route re-mount
            containerRef.current.innerHTML = '';
            try {
                google.accounts.id.renderButton(
                    containerRef.current,
                    { ...defaultButtonOptions, ...(buttonOptions || {}) },
                );
            } catch (_) { }
        }

        // Prompt One Tap (safe to call multiple times, but let's avoid it on every re-render)
        if (autoPrompt && !promptCalled.current) {
            try {
                google.accounts.id.prompt();
                promptCalled.current = true;
            } catch (_) { }
        }

        setReady(true);
    }, [clientId, onCredential, render, buttonOptions, autoPrompt, onError]);

    useEffect(() => {
        if (!clientId) return; // not configured

        // Reset prompt flag if clientId or autoPrompt changes significantly (though unlikely in this app)
        // promptCalled.current = false; // We might not want to reset it on every render though.

        // If script already there, initialize immediately
        if (typeof window !== 'undefined' && (window as any).google) {
            initGsi();
            if (onLoad) onLoad();
            return;
        }

        // Otherwise, load the script once
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.id = scriptId;
            script.onload = () => {
                initGsi();
                if (onLoad) onLoad();
            };
            script.onerror = () => {
                if (onError) onError(new Error('Failed to load Google Sign-In script'));
            };
            document.head.appendChild(script);
        } else {
            // If present but google not on window yet, wait until it loads
            const existing = document.getElementById(scriptId);
            if ((window as any).google) {
                initGsi();
            } else {
                existing?.addEventListener('load', initGsi, { once: true });
            }
        }
    }, [clientId, initGsi, scriptId, onLoad, onError]);

    return (
        <div aria-busy={!ready} className="tarxemo-google-signin flex justify-center">
            {render && <div ref={containerRef} />}
        </div>
    );
};

export default GoogleSignIn;
