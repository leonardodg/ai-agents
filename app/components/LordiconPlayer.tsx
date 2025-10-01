import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle } from 'react';

type Props = {
  icon?: any;
  iconUrl?: string;
  size?: number | string;
  [key: string]: any;
};

// Client-only wrapper that dynamically imports @lordicon/react and forwards ref
const LordiconPlayer = forwardRef<any, Props>((props, ref) => {
  const { icon, iconUrl, hover = true, ...rest } = props as any;
  const [PlayerComp, setPlayerComp] = useState<any>(null);
  const [resolvedIcon, setResolvedIcon] = useState<any>(icon ?? null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(Boolean(icon ?? false));
  const [loadError, setLoadError] = useState<string | null>(null);
  const internalRef = useRef<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    // dynamic import so SSR never attempts to evaluate @lordicon/react
    import('@lordicon/react')
      .then((mod) => {
        if (mounted) {
          console.debug('[LordiconPlayer] @lordicon/react loaded');
          setPlayerComp(() => mod.Player);
          setPlayerLoaded(true);
        }
      })
      .catch((err) => {
        // swallow errors on server or dev if package isn't resolvable there
        console.warn('Could not load @lordicon/react dynamically:', err);
        setLoadError(String(err));
      });

    // if iconUrl provided, fetch JSON on client only
    if (iconUrl) {
      fetch(iconUrl)
        .then((r) => r.json())
        .then((data) => {
          if (mounted) {
            console.debug('[LordiconPlayer] icon JSON fetched', data && data.nm);
            setResolvedIcon(data);
            setIconLoaded(true);
          }
        })
        .catch((err) => console.warn('Failed to fetch icon JSON:', err));
    }

    return () => {
      mounted = false;
    };
  }, [iconUrl]);

  // forward the internal player instance to the parent ref
  // must be called unconditionally to preserve hook order
  useImperativeHandle(ref, () => internalRef.current);

  // show placeholder + debug status until both the Player and icon are loaded
  if (!PlayerComp || !resolvedIcon) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <svg width={rest.size || 48} height={rest.size || 48} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="2" fill="#f8fafc" />
        </svg>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          <div>lordicon: playerLoaded={String(playerLoaded)} iconLoaded={String(iconLoaded)}</div>
          {loadError && <div style={{ color: 'crimson' }}>error: {loadError}</div>}
        </div>
      </div>
    );
  }



  const handleMouseEnter = () => {
    if (!hover) return;
    try {
      // prefer restarting from beginning when available
      if (internalRef.current?.playFromBeginning) internalRef.current.playFromBeginning();
      else if (internalRef.current?.play) internalRef.current.play();
    } catch (e) {
      console.debug('[LordiconPlayer] mouseenter play failed', e);
    }
  };

  const handleMouseLeave = () => {
    if (!hover) return;
    try {
      if (internalRef.current?.pause) internalRef.current.pause();
    } catch (e) {
      console.debug('[LordiconPlayer] mouseleave pause failed', e);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ display: 'inline-flex' }}>
      <PlayerComp
        ref={internalRef}
        icon={resolvedIcon}
        {...rest}
        onReady={() => {
          setPlayerReady(true);
          // bubble up if caller provided onReady
          try {
            rest.onReady?.();
          } catch (_) {}
        }}
      />
    </div>
  );
});

export default LordiconPlayer;
