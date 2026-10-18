import { useCallback, useEffect, useRef, useState } from 'react';

const ESTILOS_GLOBAIS = `
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #05070d;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ld-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    color: #e8ecf3;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s ease;
    user-select: none;
    white-space: nowrap;
  }
  .ld-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(120,180,255,0.35);
    transform: translateY(-1px);
  }
  .ld-btn:active:not(:disabled) { transform: translateY(0); }
  .ld-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .ld-btn.primary {
    background: linear-gradient(135deg, #2b7fff 0%, #1a5fd6 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 14px rgba(43,127,255,0.35);
  }
  .ld-btn.primary:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(43,127,255,0.55);
    background: linear-gradient(135deg, #3d8dff 0%, #2166e0 100%);
  }

  .ld-btn.danger {
    background: linear-gradient(135deg, #ff4d5e 0%, #d63045 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 14px rgba(255,77,94,0.35);
  }

  .ld-btn.som-on {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 14px rgba(34,197,94,0.35);
  }

  .ld-btn.mic-on {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 14px rgba(245,158,11,0.35);
  }

  .ld-btn.icon {
    padding: 5px 6px;
    min-width: 32px;
    justify-content: center;
    font-size: 16px;
  }
`;

// ═══════════════════════════════════════════════════════════
//  COMPONENTE: VistaMensagens
// ═══════════════════════════════════════════════════════════
function VistaMensagens({
  conectado, enviar,
  smsThreads, smsMensagens,
  smsSelecionado, setSmsSelecionado,
  smsInput, setSmsInput,
  smsLoading, setSmsLoading,
}) {
  const formatarData = (ms) => {
    const d = new Date(ms);
    const hoje = new Date();
    const mesmoDia = d.toDateString() === hoje.toDateString();
    if (mesmoDia) return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) +
           ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  if (!conectado) {
    return (
      <div style={{ color: '#7a8ba3', fontSize: 14 }}>
        Liga-te ao telemóvel primeiro (tab 🖥️ Espelhamento → botão Ligar)
      </div>
    );
  }

  if (smsSelecionado) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        maxWidth: 800, margin: '0 auto',
        background: 'rgba(10, 14, 24, 0.6)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 22, 38, 0.9)',
        }}>
          <button
            onClick={() => {
              setSmsSelecionado(null);
              setSmsMensagens([]);
            }}
            style={{
              background: 'none', border: 'none',
              color: '#8ec2ff', cursor: 'pointer', fontSize: 20,
            }}
          >←</button>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{smsSelecionado}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {smsMensagens.map(m => {
            const enviada = m.type === 2;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: enviada ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: 14,
                  background: enviada
                    ? 'linear-gradient(135deg, #2b7fff 0%, #1a5fd6 100%)'
                    : 'rgba(255,255,255,0.08)',
                  color: enviada ? '#fff' : '#e8ecf3',
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {m.body}
                <div style={{
                  fontSize: 10, opacity: 0.65, marginTop: 4, textAlign: 'right',
                }}>
                  {formatarData(m.date)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'flex', gap: 8, padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 22, 38, 0.9)',
        }}>
          <input
            type="text"
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && smsInput.trim()) {
                enviar({
                  action: 'sms_send',
                  address: smsSelecionado,
                  body: smsInput.trim(),
                });
              }
            }}
            placeholder="Escreve uma mensagem..."
            style={{
              flex: 1, padding: '10px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(120,180,255,0.2)',
              borderRadius: 10, color: '#fff',
              fontSize: 14, outline: 'none',
            }}
          />
          <button
            onClick={() => {
              if (!smsInput.trim()) return;
              enviar({
                action: 'sms_send',
                address: smsSelecionado,
                body: smsInput.trim(),
              });
            }}
            disabled={!smsInput.trim()}
            className="ld-btn primary"
            style={{ padding: '10px 20px' }}
          >
            Enviar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      maxWidth: 800, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(10, 14, 24, 0.6)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15, 22, 38, 0.9)',
      }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          💬 Conversas ({smsThreads.length})
        </div>
        <button
          onClick={() => {
            setSmsLoading(true);
            enviar({ action: 'sms_threads' });
          }}
          disabled={smsLoading}
          style={{
            background: 'rgba(43,127,255,0.15)',
            border: '1px solid rgba(43,127,255,0.35)',
            color: '#8ec2ff',
            padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', fontSize: 12,
          }}
        >
          {smsLoading ? '⏳ A carregar...' : '🔄 Atualizar'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {smsThreads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7a8ba3', fontSize: 13 }}>
            {smsLoading ? 'A carregar SMS do telemóvel...' : 'Sem conversas.'}
          </div>
        ) : smsThreads.map(t => (
          <button
            key={t.address}
            onClick={() => {
              setSmsSelecionado(t.address);
              setSmsMensagens([]);
              setSmsLoading(true);
              enviar({ action: 'sms_messages', address: t.address });
            }}
            style={{
              display: 'block', width: '100%',
              padding: '12px 16px',
              background: 'none', border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              color: '#e8ecf3', textAlign: 'left',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,127,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {t.address}
                {t.unread > 0 && (
                  <span style={{
                    marginLeft: 8,
                    background: '#2b7fff', color: '#fff',
                    borderRadius: 10, padding: '1px 7px', fontSize: 11,
                  }}>
                    {t.unread}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#7a8ba3' }}>
                {formatarData(t.lastDate)}
              </div>
            </div>
            <div style={{
              fontSize: 12.5, color: '#a8b4c8', marginTop: 4,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {t.lastBody}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPONENTE: VistaChamadas
// ═══════════════════════════════════════════════════════════
function VistaChamadas({
  conectado, enviar,
  chamadas, chamadasLoading, setChamadasLoading,
  chamadaSelecionada, setChamadaSelecionada,
}) {
  const formatarData = (ms) => {
    const d = new Date(ms);
    const hoje = new Date();
    const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
    const hora = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === hoje.toDateString()) return `hoje ${hora}`;
    if (d.toDateString() === ontem.toDateString()) return `ontem ${hora}`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) + ' ' + hora;
  };

  const formatarDuracao = (seg) => {
    if (seg <= 0) return 'sem resposta';
    if (seg < 60) return `${seg} s`;
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return s > 0 ? `${m} min ${s} s` : `${m} min`;
  };

  const metaTipo = (tipo) => {
    switch (tipo) {
      case 1: return { icon: '⬇️', label: 'Recebida',   cor: '#22c55e' };
      case 2: return { icon: '⬆️', label: 'Efectuada',  cor: '#2b7fff' };
      case 3: return { icon: '❌', label: 'Perdida',    cor: '#ff4d5e' };
      case 4: return { icon: '📩', label: 'Voicemail',  cor: '#a855f7' };
      case 5: return { icon: '🚫', label: 'Rejeitada',  cor: '#f59e0b' };
      case 6: return { icon: '⛔', label: 'Bloqueada',  cor: '#6b7280' };
      default: return { icon: '📞', label: 'Chamada',   cor: '#7ea2d4' };
    }
  };

  if (!conectado) {
    return (
      <div style={{ color: '#7a8ba3', fontSize: 14 }}>
        Liga-te ao telemóvel primeiro (tab 🖥️ Espelhamento → botão Ligar)
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      maxWidth: 800, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(10, 14, 24, 0.6)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15, 22, 38, 0.9)',
      }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          📞 Chamadas ({chamadas.length})
        </div>
        <button
          onClick={() => {
            setChamadasLoading(true);
            enviar({ action: 'call_log', limit: 200 });
          }}
          disabled={chamadasLoading}
          style={{
            background: 'rgba(43,127,255,0.15)',
            border: '1px solid rgba(43,127,255,0.35)',
            color: '#8ec2ff',
            padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', fontSize: 12,
          }}
        >
          {chamadasLoading ? '⏳ A carregar...' : '🔄 Atualizar'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {chamadas.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#7a8ba3', fontSize: 13 }}>
            {chamadasLoading ? 'A carregar registo de chamadas...' : 'Sem chamadas.'}
          </div>
        ) : chamadas.map(c => {
          const meta = metaTipo(c.type);
          const nomeMostrar = c.name && c.name.trim() ? c.name : c.number;
          return (
            <button
              key={c.id}
              onClick={() => setChamadaSelecionada(c)}
              style={{
                display: 'block', width: '100%',
                padding: '12px 16px',
                background: c.new ? 'rgba(43,127,255,0.05)' : 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                color: '#e8ecf3', textAlign: 'left',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,127,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = c.new ? 'rgba(43,127,255,0.05)' : 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 14,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {nomeMostrar}
                    </div>
                    <div style={{ fontSize: 11.5, color: meta.cor, marginTop: 2 }}>
                      {meta.label} · {formatarDuracao(c.duration)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#7a8ba3', flexShrink: 0, marginLeft: 8 }}>
                  {formatarData(c.date)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {chamadaSelecionada && (
        <div
          onClick={() => setChamadaSelecionada(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 340, padding: 24,
              background: 'rgba(15, 22, 38, 0.98)',
              borderRadius: 16,
              border: '1px solid rgba(120,180,255,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {chamadaSelecionada.name && chamadaSelecionada.name.trim()
                  ? chamadaSelecionada.name
                  : chamadaSelecionada.number}
              </div>
              <button
                onClick={() => setChamadaSelecionada(null)}
                style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer', fontSize: 18 }}
              >✕</button>
            </div>

            <div style={{ fontSize: 12.5, color: '#8a9bb3', lineHeight: 1.7 }}>
              <div><b>Número:</b> {chamadaSelecionada.number}</div>
              <div><b>Tipo:</b> {metaTipo(chamadaSelecionada.type).label}</div>
              <div><b>Data:</b> {new Date(chamadaSelecionada.date).toLocaleString('pt-PT')}</div>
              <div><b>Duração:</b> {formatarDuracao(chamadaSelecionada.duration)}</div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPONENTE: VistaFotos
// ═══════════════════════════════════════════════════════════
function VistaFotos({
  conectado, enviar,
  fotos, fotosLoading, setFotosLoading,
  fotoThumbs,
  fotoAberta, setFotoAberta,
  fotoCarregando, setFotoCarregando,
  fotoPreviewUrl, setFotoPreviewUrl,
  fotoBytes,
}) {
  const thumbnailsPedidosRef = useRef(new Set());

  useEffect(() => {
    if (fotos.length === 0) return;
    const pendentes = fotos.filter(f => !thumbnailsPedidosRef.current.has(f.id));
    if (pendentes.length === 0) return;

    let i = 0;
    const timer = setInterval(() => {
      if (i >= pendentes.length) {
        clearInterval(timer);
        return;
      }
      thumbnailsPedidosRef.current.add(pendentes[i].id);
      enviar({ action: 'photos_thumbnail', id: pendentes[i].id });
      i++;
    }, 35);

    return () => clearInterval(timer);
  }, [fotos, enviar]);

  const formatarTamanho = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatarData = (ms) => {
    const d = new Date(ms);
    return d.toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const abrirFoto = (foto) => {
    setFotoAberta(foto);
    setFotoCarregando(true);
    setFotoPreviewUrl(null);
    const reqId = `foto-${foto.id}-${Date.now()}`;
    enviar({ action: 'photos_full', id: foto.id, reqId });
  };

  const fecharFoto = () => {
    if (fotoPreviewUrl) {
      try { URL.revokeObjectURL(fotoPreviewUrl); } catch {}
    }
    setFotoAberta(null);
    setFotoPreviewUrl(null);
    setFotoCarregando(false);
  };

  const descarregar = () => {
    if (!fotoPreviewUrl || !fotoAberta) return;
    const a = document.createElement('a');
    a.href = fotoPreviewUrl;
    a.download = fotoAberta.name || `foto-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!conectado) {
    return (
      <div style={{ color: '#7a8ba3', fontSize: 14 }}>
        Liga-te ao telemóvel primeiro (tab 🖥️ Espelhamento → botão Ligar)
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(10, 14, 24, 0.6)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15, 22, 38, 0.9)',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>
          📷 Fotos ({fotos.length})
        </div>
        <button
          onClick={() => {
            setFotosLoading(true);
            thumbnailsPedidosRef.current = new Set();
            enviar({ action: 'photos_list', limit: 500 });
          }}
          disabled={fotosLoading}
          style={{
            background: 'rgba(43,127,255,0.15)',
            border: '1px solid rgba(43,127,255,0.35)',
            color: '#8ec2ff',
            padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', fontSize: 12,
          }}
        >
          {fotosLoading ? '⏳ A carregar...' : '🔄 Atualizar'}
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 8,
        alignContent: 'start',
      }}>
        {fotos.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: 40, textAlign: 'center', color: '#7a8ba3', fontSize: 13,
          }}>
            {fotosLoading ? 'A carregar fotos do telemóvel...' : 'Sem fotos.'}
          </div>
        ) : fotos.map(f => {
          const thumb = fotoThumbs[f.id];
          return (
            <button
              key={f.id}
              onClick={() => abrirFoto(f)}
              title={`${f.name}\n${formatarData(f.date)}\n${formatarTamanho(f.size)}`}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.borderColor = 'rgba(120,180,255,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={f.name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4a5a73', fontSize: 24,
                }}>
                  🖼️
                </div>
              )}
            </button>
          );
        })}
      </div>

      {fotoAberta && (
        <div
          onClick={fecharFoto}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 22, 38, 0.95)',
              flexShrink: 0,
            }}
          >
            <div style={{ color: '#e8ecf3', fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>{fotoAberta.name}</div>
              <div style={{ fontSize: 11, color: '#8a9bb3', marginTop: 2 }}>
                {formatarData(fotoAberta.date)} · {formatarTamanho(fotoAberta.size)}
                {fotoAberta.width > 0 && ` · ${fotoAberta.width}×${fotoAberta.height}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={descarregar}
                disabled={!fotoPreviewUrl}
                className="ld-btn primary"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                ⬇️ Descarregar
              </button>
              <button
                onClick={fecharFoto}
                className="ld-btn"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                ✕ Fechar
              </button>
            </div>
          </div>

          <div
            onClick={fecharFoto}
            style={{
              flex: 1, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              padding: 20, overflow: 'auto',
            }}
          >
            {fotoCarregando ? (
              <div style={{ color: '#8a9bb3', textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40,
                  border: '3px solid rgba(255,255,255,0.15)',
                  borderTopColor: '#2b7fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 12px',
                }} />
                A carregar foto...
              </div>
            ) : fotoPreviewUrl ? (
              <img
                src={fotoPreviewUrl}
                alt={fotoAberta.name}
                onClick={e => e.stopPropagation()}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
              />
            ) : (
              <div style={{ color: '#ff6b7a' }}>
                Não foi possível carregar a foto.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
function App() {
  const [status, setStatus] = useState('Escreve o PIN do telemóvel para começar.');
  const [conectado, setConectado] = useState(false);
  const [ligando, setLigando] = useState(false);
  const [iceConfigReady, setIceConfigReady] = useState(false);
  const [iceServers, setIceServers] = useState([
    { urls: 'stun:stun.l.google.com:19302' },
  ]);
  const [somSistema, setSomSistema] = useState(false);
  const [somMic, setSomMic] = useState(false);
  const [screenshotRecebendo, setScreenshotRecebendo] = useState(false);
  const [controloAtivo, setControloAtivo] = useState(true);

  const videoRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem('linkdroid_token') || '';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [tokenValido, setTokenValido] = useState(false);
  const [erroToken, setErroToken] = useState(false);

  const icePendentesRef = useRef([]);
  const iceConfigReadyRef = useRef(false);
  const conectadoRef = useRef(false);
  const ligandoRef = useRef(false);
  const desmontadoRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  const autoReconnectTimeoutRef = useRef(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [aCarregarHistorico, setACarregarHistorico] = useState(false);
  const [cameraStream, setCameraStream] = useState(false);
  const [cameraRecebendo, setCameraRecebendo] = useState(false);
  const [cameraFrameUrl, setCameraFrameUrl] = useState(null);
  const cameraFrameAnteriorRef = useRef(null);

  // ─── Módulo Mensagens ───
  const [vistaAtiva, setVistaAtiva] = useState('espelho');
  const [smsThreads, setSmsThreads] = useState([]);
  const [smsMensagens, setSmsMensagens] = useState([]);
  const [smsSelecionado, setSmsSelecionado] = useState(null);
  const [smsInput, setSmsInput] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  // ─── Módulo Chamadas ───
  const [chamadas, setChamadas] = useState([]);
  const [chamadasLoading, setChamadasLoading] = useState(false);
  const [chamadaSelecionada, setChamadaSelecionada] = useState(null);

  // ─── Módulo Fotos ───
  const [fotos, setFotos] = useState([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [fotoThumbs, setFotoThumbs] = useState({});
  const [fotoAberta, setFotoAberta] = useState(null);
  const [fotoCarregando, setFotoCarregando] = useState(false);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState(null);
  const [fotoBytes, setFotoBytes] = useState(null)
    const [modoTV, setModoTV] = useState(false);


  const fotoBufferRef = useRef({ reqId: null, chunks: [], total: 0 });

  // ─── Gravação ───
  const [gravando, setGravando] = useState(false);
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [modoGravacao, setModoGravacao] = useState('ecra');
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const animFrameRef = useRef(null);
  const gravacaoTimerRef = useRef(null);
  const cameraImgRef = useRef(null);
  const audioDestRef = useRef(null);
  const cameraBufferRef = useRef({ id: null, chunks: [], total: 0 });

  const offerRetryTimeoutRef = useRef(null);
  const tentativasRef = useRef(0);
  const MAX_TENTATIVAS = 10;

  const screenshotBufferRef = useRef({ id: null, chunks: [], total: 0 });

  const audioCtxRef = useRef(null);
  const nextPlaySistemaRef = useRef(0);
  const nextPlayMicRef = useRef(0);

  const somSistemaRef = useRef(false);
  const somMicRef = useRef(false);

  const dragRef = useRef({
    ativo: false, startX: 0, startY: 0, endX: 0, endY: 0, arrastou: false,
  });

  const atualizarConectado = (valor) => {
    conectadoRef.current = valor;
    setConectado(valor);
  };

  const atualizarLigando = (valor) => {
    ligandoRef.current = valor;
    setLigando(valor);
  };

  const cancelarRetry = useCallback(() => {
    clearTimeout(offerRetryTimeoutRef.current);
    offerRetryTimeoutRef.current = null;
    tentativasRef.current = 0;
  }, []);

  const enviar = useCallback((obj) => {
    const canal = dataChannelRef.current;
    if (!canal || canal.readyState !== 'open') return false;
    try {
      canal.send(JSON.stringify(obj));
      return true;
    } catch (erro) {
      console.error('Erro ao enviar comando:', erro);
      return false;
    }
  }, []);

  const limparConexao = useCallback((mensagem = 'Desconectado') => {
    const canal = dataChannelRef.current;
    const pc = pcRef.current;
    dataChannelRef.current = null;
    pcRef.current = null;
    icePendentesRef.current = [];
    dragRef.current.ativo = false;

    cancelarRetry();

    try { canal?.close(); } catch (e) { console.warn(e); }
    try { pc?.close(); } catch (e) { console.warn(e); }
    if (videoRef.current) videoRef.current.srcObject = null;
    remoteStreamRef.current = null;

    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    nextPlaySistemaRef.current = 0;
    nextPlayMicRef.current = 0;
    setSomSistema(false);
    setSomMic(false);
    somSistemaRef.current = false;
    somMicRef.current = false;

    atualizarConectado(false);
    atualizarLigando(false);
    setStatus(mensagem);
  }, [cancelarRetry]);

  const garantirAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
      nextPlaySistemaRef.current = audioCtxRef.current.currentTime;
      nextPlayMicRef.current = audioCtxRef.current.currentTime;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const tocarPCM = useCallback((pcmBytes, fila) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
    const n = Math.floor(pcmBytes.byteLength / 2);
    const floats = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      floats[i] = view.getInt16(i * 2, true) / 32768;
    }

    const buffer = ctx.createBuffer(1, floats.length, 16000);
    buffer.copyToChannel(floats, 0);

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    if (audioDestRef.current) {
      try { src.connect(audioDestRef.current); } catch (e) {}
    }

    const tocarAltofalantes = fila === 'mic' ? somMicRef.current : somSistemaRef.current;
    if (tocarAltofalantes) {
      src.connect(ctx.destination);
    }

    const nextRef = fila === 'mic' ? nextPlayMicRef : nextPlaySistemaRef;
    const now = ctx.currentTime;
    if (nextRef.current < now) nextRef.current = now;
    if (nextRef.current > now + 0.5) nextRef.current = now;

    src.start(nextRef.current);
    nextRef.current += buffer.duration;
  }, []);

  const tratarMensagemDataChannel = useCallback((evento) => {
    if (evento.data instanceof ArrayBuffer) {
      const buf = new Uint8Array(evento.data);
      if (buf.length < 1) return;
      const tipo = buf[0];
      const payload = buf.subarray(1);

      if (tipo === 0x01) {
        if (audioCtxRef.current && (somSistemaRef.current || audioDestRef.current)) {
          tocarPCM(payload, 'sistema');
        }
        return;
      }
      if (tipo === 0x02) {
        if (audioCtxRef.current && (somMicRef.current || audioDestRef.current)) {
          tocarPCM(payload, 'mic');
        }
        return;
      }
      return;
    }

    let msg;
    try { msg = JSON.parse(evento.data); } catch (e) { return; }

    if (msg.action === 'notification') {
      setNotificacoes(prev => [
        {
          app: msg.app,
          titulo: msg.titulo,
          texto: msg.texto,
          bigTexto: msg.bigTexto || '',
          notifKey: msg.notifKey || '',
          hora: msg.hora,
          id: `${msg.hora}-${Math.random()}`,
        },
        ...prev.slice(0, 49)
      ]);
      return;
    }
    if (msg.action === 'history_start') {
      setACarregarHistorico(true);
      setNotificacoes([]);
      setMostrarNotif(true);
      setStatus(`A carregar histórico (${msg.total})...`);
      return;
    }
    if (msg.action === 'history_end') {
      setACarregarHistorico(false);
      setStatus('Histórico carregado.');
      return;
    }

    if (msg.action === 'camera_start') {
      cameraBufferRef.current = {
        id: msg.id,
        chunks: new Array(msg.total),
        total: msg.total,
      };
      setCameraRecebendo(true);
      return;
    }

    if (msg.action === 'camera_chunk') {
      const b = cameraBufferRef.current;
      if (b.id === msg.id) b.chunks[msg.index] = msg.data;
      return;
    }

    if (msg.action === 'camera_stream_frame') {
      try {
        const bin = atob(msg.data);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const blob = new Blob([arr], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);

        if (cameraFrameAnteriorRef.current) {
          URL.revokeObjectURL(cameraFrameAnteriorRef.current);
        }
        cameraFrameAnteriorRef.current = url;
        setCameraFrameUrl(url);

        const img = new Image();
        img.onload = () => {
          cameraImgRef.current = img;
        };
        img.src = url;
      } catch (e) {
        console.error('Erro a processar frame:', e);
      }
      return;
    }

    if (msg.action === 'camera_end') {
      const b = cameraBufferRef.current;
      if (b.id === msg.id && b.chunks.every(c => c !== undefined)) {
        try {
          const bin = atob(b.chunks.join(''));
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          const blob = new Blob([arr], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `camera-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch (e) { console.error(e); }
      }
      cameraBufferRef.current = { id: null, chunks: [], total: 0 };
      setCameraRecebendo(false);
      return;
    }

    if (msg.action === 'accessibility_status') {
      setStatus(msg.active ? 'Acessibilidade OK.' : '⚠️ Acessibilidade desligada.');
      return;
    }

    // ─── Handlers Módulo Mensagens ───
    if (msg.action === 'sms_threads') {
      setSmsThreads(Array.isArray(msg.threads) ? msg.threads : []);
      setSmsLoading(false);
      return;
    }

    if (msg.action === 'sms_messages') {
      setSmsMensagens(Array.isArray(msg.messages) ? msg.messages : []);
      setSmsLoading(false);
      return;
    }

    if (msg.action === 'sms_sent') {
      if (msg.ok) {
        setSmsMensagens(prev => [...prev, {
          id: `local-${Date.now()}`,
          address: msg.address,
          body: msg.body,
          date: Date.now(),
          type: 2,
          read: true,
        }]);
        setSmsInput('');
        setStatus('SMS enviado.');
      } else {
        setStatus('Erro a enviar SMS.');
      }
      return;
    }

    // ─── Handler Módulo Chamadas ───
    if (msg.action === 'call_log') {
      setChamadas(Array.isArray(msg.calls) ? msg.calls : []);
      setChamadasLoading(false);
      return;
    }

    // ─── Handlers Módulo Fotos ───
    if (msg.action === 'photos_list') {
      const lista = Array.isArray(msg.photos) ? msg.photos : [];
      setFotos(lista);
      setFotosLoading(false);
      setFotoThumbs({});
      setStatus(`${lista.length} fotos recebidas.`);
      return;
    }

    if (msg.action === 'photos_thumbnail') {
      if (msg.error) return;
      try {
        const url = `data:image/jpeg;base64,${msg.data}`;
        setFotoThumbs(prev => ({ ...prev, [msg.id]: url }));
      } catch (e) {
        console.warn('Erro thumbnail:', e);
      }
      return;
    }

    if (msg.action === 'photo_start') {
      fotoBufferRef.current = {
        reqId: msg.reqId,
        chunks: new Array(msg.total),
        total: msg.total,
      };
      return;
    }

    if (msg.action === 'photo_chunk') {
      const b = fotoBufferRef.current;
      if (b.reqId === msg.reqId) b.chunks[msg.index] = msg.data;
      return;
    }

    if (msg.action === 'photo_end') {
      const b = fotoBufferRef.current;
      if (b.reqId !== msg.reqId) return;
      try {
        const base64 = b.chunks.join('');
        const bin = atob(base64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const blob = new Blob([arr], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setFotoPreviewUrl(url);
        setFotoBytes(arr);
        setFotoCarregando(false);
        setStatus('Foto carregada.');
      } catch (e) {
        console.error('Erro a processar foto:', e);
        setFotoCarregando(false);
      }
      fotoBufferRef.current = { reqId: null, chunks: [], total: 0 };
      return;
    }

    if (msg.action === 'photo_error') {
      setStatus(`Erro na foto: ${msg.message}`);
      setFotoCarregando(false);
      return;
    }

    if (msg.action === 'restarting') {
      setStatus('Telemóvel a mudar de modo...');
      limparConexao('A reiniciar...');

      clearTimeout(autoReconnectTimeoutRef.current);
      autoReconnectTimeoutRef.current = setTimeout(() => {
        if (!desmontadoRef.current) conectar();
      }, 2500);
      return;
    }

    if (msg.action === 'service_stopping') {
      setStatus('Transmissão parada no telemóvel.');
      limparConexao('Transmissão parada.');
      return;
    }

    if (msg.action === 'screenshot_start') {
      screenshotBufferRef.current = {
        id: msg.id, chunks: new Array(msg.total), total: msg.total,
      };
      setScreenshotRecebendo(true);
      setStatus('A receber screenshot...');
      return;
    }

    if (msg.action === 'screenshot_chunk') {
      const b = screenshotBufferRef.current;
      if (b.id === msg.id) b.chunks[msg.index] = msg.data;
      return;
    }

    if (msg.action === 'screenshot_end') {
      const b = screenshotBufferRef.current;
      if (b.id === msg.id && b.chunks.every((c) => c !== undefined)) {
        try {
          const base64 = b.chunks.join('');
          const bin = atob(base64);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);

          const blob = new Blob([arr], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `linkdroid-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setStatus('Screenshot guardado.');
        } catch (e) {
          setStatus('Erro a processar screenshot.');
        }
      }
      screenshotBufferRef.current = { id: null, chunks: [], total: 0 };
      setScreenshotRecebendo(false);
      return;
    }

    if (msg.action === 'screenshot_error') {
      setStatus(`Erro no screenshot: ${msg.message}`);
      setScreenshotRecebendo(false);
      return;
    }
  }, [tocarPCM, limparConexao]);

  const enviarOfferComRetry = useCallback(async (pc, tentativa = 0) => {
    try {
      if (pcRef.current !== pc) return;
      if (!pc || pc.signalingState === 'closed') return;
      if (conectadoRef.current) return;

      if (tentativa === 0) {
        const offer = await pc.createOffer();
        if (pcRef.current !== pc) return;
        await pc.setLocalDescription(offer);
        if (pcRef.current !== pc) return;
      }

      const socket = wsRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket caiu');
      }

      socket.send(JSON.stringify({
        type: 'offer', target: 'android-001', sdp: pc.localDescription.sdp,
      }));

      console.log(`Offer enviada (${tentativa + 1}/${MAX_TENTATIVAS})`);
      setStatus(`Offer enviada (${tentativa + 1}/${MAX_TENTATIVAS}). A aguardar resposta...`);

      clearTimeout(offerRetryTimeoutRef.current);
      offerRetryTimeoutRef.current = setTimeout(() => {
        if (pcRef.current !== pc) return;
        if (conectadoRef.current) return;
        if (pc.signalingState === 'closed') return;

        const proxima = tentativa + 1;
        if (proxima >= MAX_TENTATIVAS) {
          setStatus('Não foi possível ligar após várias tentativas.');
          limparConexao('Falha após várias tentativas.');
          return;
        }
        enviarOfferComRetry(pc, proxima);
      }, 3000);
    } catch (e) {
      console.error('Erro a enviar offer:', e);
    }
  }, [limparConexao]);

  const iniciarWebSocket = useCallback(() => {
    if (desmontadoRef.current) return;
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
    }
    setStatus('A ligar ao servidor de sinalização...');

    if (!token) {
      setStatus('Escreve o PIN do telemóvel para ligar.');
      return;
    }

    const ws = new WebSocket(
      `wss://linkdroid-signaling-server.onrender.com/?deviceId=web-001&role=web&token=${encodeURIComponent(token)}`
    );
    wsRef.current = ws;

    ws.onopen = () => setStatus('PIN aceite; a preparar ligação...');

    ws.onmessage = async (evento) => {
      let dados;
      try { dados = JSON.parse(evento.data); } catch { return; }

      if (dados.type === 'ice-config') {
        const servidores = Array.isArray(dados.iceServers) ? dados.iceServers : [];
        const config = servidores.length > 0
          ? servidores
          : [{ urls: 'stun:stun.l.google.com:19302' }];
        setIceServers(config);
        iceConfigReadyRef.current = true;
        setIceConfigReady(true);
        if (!conectadoRef.current && !ligandoRef.current) {
          setStatus('Pronto. Clica em «Ligar ao telemóvel».');
        }
        return;
      }

      if (dados.type === 'peer_reconnected') {
        console.log('Android reconectou — a limpar e reconectar');
        limparConexao('Telemóvel reconectou...');

        clearTimeout(autoReconnectTimeoutRef.current);
        autoReconnectTimeoutRef.current = setTimeout(() => {
          if (!desmontadoRef.current) conectar();
        }, 2000);
        return;
      }

      const pc = pcRef.current;
      if (!pc) return;

      if (dados.type === 'answer') {
        cancelarRetry();
        tentativasRef.current = 0;

        try {
          if (pc.signalingState === 'closed') return;
          await pc.setRemoteDescription({ type: 'answer', sdp: dados.sdp });
          const pendentes = icePendentesRef.current.splice(0);
          for (const c of pendentes) {
            try { await pc.addIceCandidate(c); } catch (e) { console.warn(e); }
          }
        } catch (erro) {
          if (pcRef.current === pc) limparConexao('Erro ao negociar WebRTC');
        }
        return;
      }

      if (dados.type === 'candidate') {
        if (!dados.candidate) return;
        try {
          const c = new RTCIceCandidate(dados.candidate);
          if (!pc.remoteDescription) icePendentesRef.current.push(c);
          else await pc.addIceCandidate(c);
        } catch (e) { console.warn(e); }
      }
    };

    ws.onerror = () => {
      if (!desmontadoRef.current) setStatus('Erro no servidor.');
    };

    ws.onclose = (evento) => {
      if (!desmontadoRef.current) {
        if (evento.code === 1008) {
          setErroToken(true);
          setTokenValido(false);
          localStorage.removeItem('linkdroid_token');
          setStatus('PIN inválido. Tenta outra vez.');
          return;
        }
        limparConexao('Servidor desconectado');
        iceConfigReadyRef.current = false;
        setIceConfigReady(false);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(iniciarWebSocket, 3000);
      }
    };
  }, [limparConexao, cancelarRetry, token]);

  useEffect(() => {
    if (!tokenValido) return;
    desmontadoRef.current = false;
    const timer = setTimeout(() => {
      if (!desmontadoRef.current) iniciarWebSocket();
    }, 200);

    return () => {
      desmontadoRef.current = true;
      clearTimeout(timer);
      clearTimeout(reconnectTimeoutRef.current);
      clearTimeout(autoReconnectTimeoutRef.current);
      clearTimeout(offerRetryTimeoutRef.current);
      clearInterval(gravacaoTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (wsRef.current) try { wsRef.current.close(); } catch {}
      const pc = pcRef.current;
      const canal = dataChannelRef.current;
      pcRef.current = null;
      dataChannelRef.current = null;
      try { canal?.close(); pc?.close(); } catch {}
      if (audioCtxRef.current) try { audioCtxRef.current.close(); } catch {}
    };
  }, [iniciarWebSocket, token, tokenValido]);

useEffect(() => {
  const handleKeyDown = (e) => {
    if (!conectadoRef.current) return;
    if (!controloAtivo) return; // ← NOVA LINHA
    if (dataChannelRef.current?.readyState !== 'open') return;
    if (e.repeat) return;
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt') return;
    enviar({ action: 'key', key: e.key, code: e.code });
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [enviar, controloAtivo]); // ← adiciona controloAtivo

 useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handler = (e) => {
    if (!conectadoRef.current) return;
    if (!controloAtivo) return; // ← NOVA LINHA
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const dx = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
    enviar({
      action: 'scroll',
      deltaY: dy,
      deltaX: dx,
      preciso: e.shiftKey
    });
  };

  video.addEventListener('wheel', handler, { passive: false });
  return () => video.removeEventListener('wheel', handler);
}, [enviar, tokenValido, conectado, controloAtivo]); // ← adiciona controloAtivo
  useEffect(() => {
  if (vistaAtiva !== 'espelho' || !conectado) return;
  const v = videoRef.current;
  const s = remoteStreamRef.current;
  if (v && s && v.srcObject !== s) {
    v.srcObject = s;
  }
  if (v) v.play().catch(() => {});
}, [vistaAtiva, conectado]);

  const iniciarGravacao = useCallback((modo = 'ecra') => {
    const video = videoRef.current;
    if (!video) return;

    if (modo === 'ecra' && !video.videoWidth) {
      setStatus('Vídeo ainda não está pronto.');
      return;
    }

    if (modo === 'camera' && !cameraImgRef.current) {
      setStatus('⚠️ Câmara em direto não está ativa. Liga 👁️ primeiro.');
      return;
    }

    garantirAudioCtx();
    const ctxAudio = audioCtxRef.current;
    if (!ctxAudio) return;

    const canvas = document.createElement('canvas');

    if (modo === 'camera') {
      const imgCam = cameraImgRef.current;
      canvas.width = imgCam?.naturalWidth || 640;
      canvas.height = imgCam?.naturalHeight || 480;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);

    const audioDest = ctxAudio.createMediaStreamDestination();
    audioDestRef.current = audioDest;

    const audioTracks = audioDest.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      stream.addTrack(audioTracks[0]);
      console.log('Áudio ligado à gravação');
    }

    const tipos = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    const tipo = tipos.find((t) => MediaRecorder.isTypeSupported(t)) || 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType: tipo });
    mediaRecorderRef.current = recorder;
    recordingChunksRef.current = [];
    setModoGravacao(modo);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordingChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const totalBytes = recordingChunksRef.current.reduce((s, c) => s + c.size, 0);
      console.log(`Gravação (${modo}): ${recordingChunksRef.current.length} chunks, ${totalBytes} bytes`);

      if (totalBytes === 0) {
        setStatus('Gravação falhou — sem dados.');
        recordingChunksRef.current = [];
        return;
      }

      const blob = new Blob(recordingChunksRef.current, { type: tipo });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linkdroid-${modo}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(`Gravação guardada (${(totalBytes / 1024 / 1024).toFixed(1)} MB).`);
      recordingChunksRef.current = [];
    };

    const desenhar = () => {
      const rec = mediaRecorderRef.current;
      if (!rec || rec.state !== 'recording') return;

      try {
        if (modo === 'camera') {
          const imgCam = cameraImgRef.current;
          if (imgCam && imgCam.complete && imgCam.naturalWidth > 0) {
            ctx.drawImage(imgCam, 0, 0, canvas.width, canvas.height);
          }
        } else {
          if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          const imgCam = cameraImgRef.current;
          if (cameraStream && imgCam && imgCam.complete && imgCam.naturalWidth > 0) {
            const pipW = Math.floor(canvas.width * 0.25);
            const pipH = Math.floor(pipW * 0.75);
            const margin = Math.floor(canvas.width * 0.02);
            const x = canvas.width - pipW - margin;
            const y = canvas.height - pipH - margin;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(x - 4, y - 4, pipW + 8, pipH + 8);
            ctx.drawImage(imgCam, x, y, pipW, pipH);
          }
        }
      } catch (e) {
        console.warn('Erro a desenhar frame:', e);
      }

      animFrameRef.current = requestAnimationFrame(desenhar);
    };

    if (modo === 'camera') {
      const imgCam = cameraImgRef.current;
      if (imgCam && imgCam.complete) {
        ctx.drawImage(imgCam, 0, 0, canvas.width, canvas.height);
      }
    } else if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    recorder.start(1000);
    setGravando(true);
    setTempoGravacao(0);
    setStatus(`A gravar (${modo === 'camera' ? 'câmara' : 'ecrã'})...`);
    animFrameRef.current = requestAnimationFrame(desenhar);

    gravacaoTimerRef.current = setInterval(() => {
      setTempoGravacao((t) => t + 1);
    }, 1000);
  }, [cameraStream]);

  const pararGravacao = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (gravacaoTimerRef.current) {
      clearInterval(gravacaoTimerRef.current);
      gravacaoTimerRef.current = null;
    }

    audioDestRef.current = null;

    setGravando(false);
    setTempoGravacao(0);
  }, []);

  const formatarTempo = (s) => {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
  };

  const conectar = async () => {
    if (ligandoRef.current || conectadoRef.current) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setStatus('O servidor ainda não está conectado');
      return;
    }
    if (!iceConfigReadyRef.current) {
      setStatus('A aguardar configuração ICE...');
      return;
    }

    atualizarLigando(true);
    tentativasRef.current = 0;
    setStatus('A iniciar ligação WebRTC...');

    try {
      if (pcRef.current) {
        limparConexao('A reiniciar...');
        atualizarLigando(true);
      }
      icePendentesRef.current = [];

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      pc.addTransceiver('video', { direction: 'recvonly' });

      const canal = pc.createDataChannel('control', { ordered: true });
      canal.binaryType = 'arraybuffer';
      dataChannelRef.current = canal;

      canal.onopen = () => {
        if (pcRef.current !== pc) return;
        atualizarConectado(true);
        atualizarLigando(false);
        setStatus('Ligado! Vídeo e controlo disponíveis.');
      };

      canal.onclose = () => {
        if (pcRef.current !== pc) return;
        atualizarConectado(false);
        atualizarLigando(false);
        setStatus('Canal de controlo fechado');
      };

      canal.onerror = (e) => {
        if (e?.error?.message?.includes('Close called')) return;
        console.warn('Erro DC:', e);
      };
      canal.onmessage = tratarMensagemDataChannel;

      pc.ontrack = async (evento) => {
        if (pcRef.current !== pc) return;
        const stream = evento.streams?.[0];
        if (!stream) return;
        remoteStreamRef.current = stream;   // ← guarda o stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch {}
        }
      };

      pc.onicecandidate = (evento) => {
        if (!evento.candidate) return;
        const s = wsRef.current;
        if (s?.readyState !== WebSocket.OPEN) return;
        s.send(JSON.stringify({
          type: 'candidate', target: 'android-001', candidate: evento.candidate,
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return;
        if (pc.connectionState === 'failed') {
          limparConexao('Ligação WebRTC falhou. Tenta novamente.');
        }
      };

      enviarOfferComRetry(pc);
    } catch (erro) {
      console.error(erro);
      limparConexao(`Erro: ${erro.message}`);
    }
  };

  const coordsRelativas = (e) => {
    const video = videoRef.current;
    if (!video) return null;
    const rect = video.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return null;
    const videoAspect = vw / vh, elementAspect = rect.width / rect.height;
    let contentW, contentH, offsetX, offsetY;
    if (videoAspect > elementAspect) {
      contentW = rect.width; contentH = rect.width / videoAspect;
      offsetX = 0; offsetY = (rect.height - contentH) / 2;
    } else {
      contentH = rect.height; contentW = rect.height * videoAspect;
      offsetX = (rect.width - contentW) / 2; offsetY = 0;
    }
    const px = e.clientX - rect.left - offsetX;
    const py = e.clientY - rect.top - offsetY;
    if (px < 0 || py < 0 || px > contentW || py > contentH) return null;
    return {
      x: Math.max(0, Math.min(1, px / contentW)),
      y: Math.max(0, Math.min(1, py / contentH)),
    };
  };

  const onPointerDown = (e) => {
    if (!conectadoRef.current) return;
     if (!controloAtivo) return;
    const coords = coordsRelativas(e);
    if (!coords) return;
    dragRef.current = {
      ativo: true, startX: coords.x, startY: coords.y,
      endX: coords.x, endY: coords.y, arrastou: false,
    };
    try { videoRef.current?.setPointerCapture(e.pointerId); } catch {}
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.ativo) return;
    const coords = coordsRelativas(e);
    if (!coords) return;
    dragRef.current.endX = coords.x;
    dragRef.current.endY = coords.y;
    const dx = coords.x - dragRef.current.startX;
    const dy = coords.y - dragRef.current.startY;
    if (Math.sqrt(dx * dx + dy * dy) > 0.01) dragRef.current.arrastou = true;
  };

  const terminarPointer = (e) => {
    if (!dragRef.current.ativo) return;
    const cF = coordsRelativas(e);
    if (cF) { dragRef.current.endX = cF.x; dragRef.current.endY = cF.y; }
    const { startX, startY, endX, endY, arrastou } = dragRef.current;
    dragRef.current.ativo = false;
    if (!conectadoRef.current) return;

    const dx = endX - startX;
    const dy = endY - startY;
    const deslocamento = Math.sqrt(dx * dx + dy * dy);
    const foiSwipe = arrastou || deslocamento > 0.02;

    if (foiSwipe) {
      const dur = Math.min(800, Math.max(300, Math.round(deslocamento * 1500)));
      enviar({ action: 'swipe', x1: startX, y1: startY, x2: endX, y2: endY, duration: dur });
    } else {
      enviar({ action: 'tap', x: startX, y: startY });
    }

    try {
      if (videoRef.current?.hasPointerCapture(e.pointerId)) {
        videoRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const corStatus = (() => {
    if (status.startsWith('⚠️') || status.toLowerCase().includes('erro') ||
        status.toLowerCase().includes('falhou') || status.toLowerCase().includes('desconect') ||
        status.toLowerCase().includes('não foi possível')) {
      return { bg: 'rgba(255,77,94,0.15)', border: 'rgba(255,77,94,0.4)', dot: '#ff4d5e' };
    }
    if (conectado) {
      return { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', dot: '#22c55e' };
    }
    if (ligando) {
      return { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', dot: '#fbbf24' };
    }
    return { bg: 'rgba(120,150,200,0.12)', border: 'rgba(120,150,200,0.3)', dot: '#7ea2d4' };
  })();

  if (!tokenValido) {
    return (
      <>
        <style>{ESTILOS_GLOBAIS}</style>
        <div
          style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(1200px 600px at 20% 0%, #16233d 0%, #0a0e1a 55%, #05070d 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
            color: '#e8ecf3',
          }}
        >
          <div
            style={{
              width: 400,
              padding: 32,
              background: 'rgba(15, 22, 38, 0.9)',
              backdropFilter: 'blur(14px)',
              borderRadius: 24,
              border: '1px solid rgba(120,180,255,0.2)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.75)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, #2b7fff 0%, #7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 24,
                boxShadow: '0 8px 24px rgba(43,127,255,0.5)',
              }}
            >
              🔑
            </div>

            <div style={{ fontSize: 22, fontWeight: 600, textAlign: 'center' }}>
              LinkDroid
            </div>

            <div
              style={{
                fontSize: 13.5,
                color: '#8a9bb3',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Escreve o PIN de 6 caracteres que aparece na app LinkDroid do teu telemóvel.
              O telemóvel tem de estar <b>com a transmissão ativa</b> (wizard 4/4 ✅).
            </div>

            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                const v = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
                  .slice(0, 6);
                setTokenInput(v);
                setErroToken(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tokenInput.length >= 4) {
                  localStorage.setItem('linkdroid_token', tokenInput);
                  setToken(tokenInput);
                  setTokenValido(true);
                }
              }}
              placeholder="XXXXXX"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 24,
                fontFamily: 'monospace',
                letterSpacing: 8,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: erroToken
                  ? '2px solid #ff4d5e'
                  : '2px solid rgba(120,180,255,0.25)',
                borderRadius: 12,
                color: '#fff',
                outline: 'none',
                textTransform: 'uppercase',
              }}
            />

            {erroToken && (
              <div
                style={{
                  fontSize: 12.5,
                  color: '#ff6b7a',
                  textAlign: 'center',
                }}
              >
                PIN inválido ou telemóvel não está ligado. Confirma o token no telemóvel.
              </div>
            )}

            <button
              onClick={() => {
                if (tokenInput.length < 4) return;
                localStorage.setItem('linkdroid_token', tokenInput);
                setToken(tokenInput);
                setTokenValido(true);
                setErroToken(false);
              }}
              disabled={tokenInput.length < 4}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 15,
                fontWeight: 600,
                background: tokenInput.length >= 4
                  ? 'linear-gradient(135deg, #2b7fff 0%, #1a5fd6 100%)'
                  : 'rgba(255,255,255,0.08)',
                color: tokenInput.length >= 4 ? '#fff' : '#7a8ba3',
                border: 'none',
                borderRadius: 12,
                cursor: tokenInput.length >= 4 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              Ligar
            </button>

            <div
              style={{
                fontSize: 11.5,
                color: '#5a6b83',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              O PIN é gerado automaticamente no telemóvel e permanece o mesmo entre sessões.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{ESTILOS_GLOBAIS}</style>

      <div
        style={{
          height: '100vh',
          width: '100vw',
          padding: 0,
          boxSizing: 'border-box',
          backgroundColor: '#05070d',
          color: '#e8ecf3',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(1200px 600px at 20% 0%, #16233d 0%, #0a0e1a 55%, #05070d 100%)',
            borderRadius: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
          }}
        >
          {!modoTV && (
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              background: 'rgba(15, 22, 38, 0.72)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              zIndex: 10,
              flexWrap: 'wrap',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #2b7fff 0%, #7c3aed 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                boxShadow: '0 4px 14px rgba(43,127,255,0.4)',
              }}
            >
              L
            </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  LinkDroid
                </span>
                <span style={{ fontSize: 11, color: '#7a8ba3' }}>
                  Controlo remoto
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: corStatus.bg,
                border: `1px solid ${corStatus.border}`,
                fontSize: 12.5,
                color: '#c8d3e3',
                maxWidth: 460,
                animation: 'fade-in 0.25s ease',
              }}
            >
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: corStatus.dot,
                  boxShadow: `0 0 10px ${corStatus.dot}`,
                  animation: ligando ? 'pulse-dot 1s infinite' : 'none',
                  flexShrink: 0,
                }}
              />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {status}
              </span>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!conectado && (
                <button
                  onClick={conectar}
                  disabled={ligando || !iceConfigReady}
                  className="ld-btn primary"
                >
                  {ligando ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12, height: 12,
                          border: '2px solid rgba(255,255,255,0.35)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                      A ligar ao telemóvel...
                    </>
                  ) : iceConfigReady ? (
                    <>⚡ Ligar ao telemóvel</>
                  ) : (
                    <>⏳ A aguardar telemóvel...</>
                  )}
                </button>
              )}

              {conectado && (
                <>
                  <button
                    onClick={() => {
                      localStorage.removeItem('linkdroid_token');
                      setToken('');
                      setTokenInput('');
                      setTokenValido(false);
                      setConectado(false);
                      if (wsRef.current) {
                        try { wsRef.current.close(); } catch {}
                      }
                    }}
                    className="ld-btn icon"
                    title="Esquecer PIN"
                    style={{ fontSize: 13 }}
                  >
                    🔓
                  </button>
                  <button
                    onClick={() => setControloAtivo(v => !v)}
                    className={`ld-btn icon ${controloAtivo ? 'som-on' : ''}`}
                    title={controloAtivo ? 'Controlo remoto ATIVO (clica para só ver)' : 'Só a ver (clica para ativar controlo)'}
                  >
                    {controloAtivo ? '🎮' : '👀'}
                  </button>

                  <button
                    onClick={() => {
                      garantirAudioCtx();
                      const novo = !somSistema;
                      setSomSistema(novo);
                      somSistemaRef.current = novo;
                    }}
                    className={`ld-btn icon ${somSistema ? 'som-on' : ''}`}
                    title={somSistema ? 'Som do sistema ON' : 'Som do sistema OFF'}
                  >
                    🎵
                  </button>

                  <button
                    onClick={() => {
                      garantirAudioCtx();
                      const novo = !somMic;
                      setSomMic(novo);
                      somMicRef.current = novo;
                    }}
                    className={`ld-btn icon ${somMic ? 'mic-on' : ''}`}
                    title={somMic ? 'Som ambiente ON' : 'Som ambiente OFF'}
                  >
                    🎤
                  </button>

                  <button
                    onClick={() => enviar({ action: 'screenshot' })}
                    disabled={screenshotRecebendo}
                    className="ld-btn icon"
                    title="Tirar screenshot"
                  >
                    {screenshotRecebendo ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14, height: 14,
                          border: '2px solid rgba(255,255,255,0.35)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                    ) : '📸'}
                  </button>

                  <button onClick={() => enviar({ action: 'volume_down' })} className="ld-btn icon" title="Diminuir volume">🔉</button>
                  <button onClick={() => enviar({ action: 'volume_up' })} className="ld-btn icon" title="Aumentar volume">🔊</button>
                  <button onClick={() => enviar({ action: 'power' })} className="ld-btn icon" title="Bloquear ecrã">🔒</button>
                  <button onClick={() => enviar({ action: 'wake' })} className="ld-btn icon" title="Acordar ecrã">⚡</button>
                  <button
                    onClick={() => setMostrarNotif(v => !v)}
                    className="ld-btn icon"
                    title="Notificações"
                  >
                    🔔 {notificacoes.length > 0 ? notificacoes.length : ''}
                  </button>
                  <button
                    onClick={() => enviar({ action: 'request_history' })}
                    disabled={aCarregarHistorico}
                    className="ld-btn icon"
                    title="Ver histórico"
                  >
                    {aCarregarHistorico ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14, height: 14,
                          border: '2px solid rgba(255,255,255,0.35)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                    ) : '📜'}
                  </button>

                  <button
                    onClick={() => enviar({ action: 'camera_photo' })}
                    disabled={cameraRecebendo}
                    className="ld-btn icon"
                    title="Tirar foto com a câmara do telemóvel"
                  >
                    📷
                  </button>

                 <button
                    onClick={() => {
                      const novo = !cameraStream;
                      setCameraStream(novo);
                      enviar({ action: novo ? 'camera_stream_start' : 'camera_stream_stop' });
                    }}
                    className={`ld-btn icon ${cameraStream ? 'som-on' : ''}`}
                    title={cameraStream ? 'Parar câmara em direto' : 'Ver câmara em direto'}
                  >
                    👁️
                  </button>

                  <button
                    onClick={() => enviar({ action: 'camera_switch' })}
                    className="ld-btn icon"
                    title="Trocar câmara frontal/traseira"
                  >
                    🔄
                  </button>

                  <button
                    onClick={() => {
                      if (gravando) {
                        pararGravacao();
                      } else {
                        iniciarGravacao('ecra');
                      }
                    }}
                    className={`ld-btn ${gravando && modoGravacao === 'ecra' ? 'danger' : ''}`}
                    title={gravando && modoGravacao === 'ecra' ? 'Parar gravação' : 'Gravar ecrã do telemóvel'}
                    style={{ minWidth: 80, justifyContent: 'center' }}
                  >
                    {gravando && modoGravacao === 'ecra'
                      ? `⏹️ ${formatarTempo(tempoGravacao)}`
                      : '⏺️ Ecrã'}
                  </button>
                  <button
                    onClick={() => {
                      if (gravando) {
                        pararGravacao();
                      } else {
                        iniciarGravacao('camera');
                      }
                    }}
                    className={`ld-btn icon ${gravando && modoGravacao === 'camera' ? 'danger' : ''}`}
                    title={gravando && modoGravacao === 'camera' ? `Parar gravação (${formatarTempo(tempoGravacao)})` : 'Gravar câmara em direto (ambiente)'}
                  >
                    {gravando && modoGravacao === 'camera' ? '⏹️' : '🎥'}
                  </button>
                </>
              )}
            </div>
          </header>
          )}

          {conectado && !modoTV && (
            <div style={{
              display: 'flex',
              gap: 4,
              padding: '6px 10px',
              background: 'rgba(15, 22, 38, 0.72)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
              overflowX: 'auto',
            }}>
             {[
                { id: 'espelho', icon: '🖥️', label: 'Controlo Remoto' },
                { id: 'tv', icon: '📺', label: 'Modo TV', acao: () => setModoTV(true) },
                { id: 'mensagens', icon: '💬', label: 'Mensagens' },
                { id: 'chamadas', icon: '📞', label: 'Chamadas' },
                { id: 'fotos', icon: '📷', label: 'Fotos' },
                
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.acao) {
                      tab.acao();
                      return;
                    }
                    setVistaAtiva(tab.id);
                    if (tab.id === 'mensagens' && smsThreads.length === 0) {
                      setSmsLoading(true);
                      enviar({ action: 'sms_threads' });
                    }
                    if (tab.id === 'chamadas' && chamadas.length === 0) {
                      setChamadasLoading(true);
                      enviar({ action: 'call_log', limit: 200 });
                    }
                    if (tab.id === 'fotos' && fotos.length === 0) {
                      setFotosLoading(true);
                      enviar({ action: 'photos_list', limit: 500 });
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    background: (vistaAtiva === tab.id && !tab.acao)
                      ? 'linear-gradient(135deg, #2b7fff 0%, #1a5fd6 100%)'
                      : 'rgba(255,255,255,0.04)',
                    color: (vistaAtiva === tab.id && !tab.acao) ? '#fff' : '#c8d3e3',
                    border: '1px solid',
                    borderColor: (vistaAtiva === tab.id && !tab.acao) ? 'transparent' : 'rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}

          <main
  style={{
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  }}
>
  {/* ─── ESPELHAMENTO: SEMPRE MONTADO, só escondido ─── */}
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: vistaAtiva === 'espelho' ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    {!conectado && (
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, pointerEvents: 'none', zIndex: 1,
        }}
      >
        <div
          style={{
            width: 90, height: 90, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(43,127,255,0.15) 0%, rgba(124,58,237,0.15) 100%)',
            border: '1px solid rgba(120,150,200,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, marginBottom: 4,
          }}
        >
          📱
        </div>
        <div style={{ fontSize: 15, color: '#8a9bb3', fontWeight: 500, textAlign: 'center', maxWidth: 320 }}>
          {ligando ? 'A estabelecer ligação com o telemóvel...'
            : iceConfigReady ? 'Clica em «Ligar ao telemóvel» para começar'
            : 'A aguardar o telemóvel...'}
        </div>
        <div style={{ fontSize: 12.5, color: '#5a6b83', textAlign: 'center', maxWidth: 360, lineHeight: 1.5 }}>
          Certifica-te que a app LinkDroid está aberta e a transmitir no telemóvel
        </div>
      </div>
    )}

    <video
      ref={videoRef}
      autoPlay
      playsInline
      onClick={async () => {
        try { await videoRef.current?.play(); } catch {}
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={terminarPointer}
      onPointerCancel={terminarPointer}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: conectado ? 'pointer' : 'default',
        touchAction: 'none',
        userSelect: 'none',
        objectFit: 'contain',
        background: '#000',
        opacity: conectado ? 1 : 0.15,
        transition: 'opacity 0.4s ease',
        position: 'relative',
        zIndex: 2,
      }}
    />

    {gravando && (
      <div
        style={{
          position: 'absolute',
          top: 20, left: 20,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(255, 40, 60, 0.9)',
          borderRadius: 999,
          fontSize: 13, fontWeight: 600, color: '#fff',
          boxShadow: '0 4px 16px rgba(255,40,60,0.5)',
          zIndex: 40,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#fff',
            animation: 'pulse-dot 1s infinite',
          }}
        />
        REC {modoGravacao === 'camera' ? '🎥' : '⏺️'} {formatarTempo(tempoGravacao)}
      </div>
    )}

    {mostrarNotif && (
      <div style={{
        position: 'absolute', top: 60, right: 20,
        width: 380, maxHeight: '70vh',
        background: 'rgba(15, 22, 38, 0.95)',
        backdropFilter: 'blur(14px)',
        borderRadius: 16,
        border: '1px solid rgba(120,180,255,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        zIndex: 50, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 14, fontWeight: 600,
        }}>
          <span>
            {aCarregarHistorico ? '📜 A carregar...' : '🔔 Notificações'} ({notificacoes.length})
          </span>
          <button
            onClick={() => setNotificacoes([])}
            style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer', fontSize: 12 }}
          >Limpar</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {notificacoes.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#7a8ba3', fontSize: 13 }}>
              Sem notificações ainda.
            </div>
          ) : notificacoes.map(n => {
            const textoMostrar = n.bigTexto || n.texto || '';
            return (
              <div key={n.id} style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 12.5,
              }}>
                <div style={{ color: '#7ea2d4', fontSize: 11, marginBottom: 3 }}>
                  {n.app}
                </div>
                {n.titulo && <div style={{ fontWeight: 600, color: '#e8ecf3' }}>{n.titulo}</div>}
                {textoMostrar && (
                  <div style={{ color: '#a8b4c8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {textoMostrar}
                  </div>
                )}
                {n.notifKey && (
                  <button
                    onClick={() => enviar({ action: 'open_notification', key: n.notifKey })}
                    style={{
                      marginTop: 6, padding: '4px 10px', fontSize: 11,
                      background: 'rgba(43,127,255,0.15)',
                      border: '1px solid rgba(43,127,255,0.35)',
                      borderRadius: 6, color: '#8ec2ff', cursor: 'pointer',
                    }}
                  >
                    ↗ Abrir no telemóvel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}

    {cameraStream && (
      <div style={{
        position: 'absolute', bottom: 20, right: 20,
        width: 320,
        background: 'rgba(15, 22, 38, 0.95)',
        backdropFilter: 'blur(14px)',
        borderRadius: 16,
        border: '1px solid rgba(120,180,255,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        zIndex: 50, overflow: 'hidden',
      }}>
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13, fontWeight: 600,
        }}>
          <span>👁️ Câmara em direto</span>
          <button
            onClick={() => {
              setCameraStream(false);
              enviar({ action: 'camera_stream_stop' });
            }}
            style={{
              background: 'none', border: 'none',
              color: '#ff6b7a', cursor: 'pointer', fontSize: 12,
            }}
          >
            Parar
          </button>
        </div>
        <div style={{
          width: '100%', aspectRatio: '4 / 3',
          background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {cameraFrameUrl ? (
            <img
              src={cameraFrameUrl}
              alt="Câmara em direto"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ color: '#7a8ba3', fontSize: 13 }}>A aguardar frames...</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => enviar({ action: 'camera_switch' })}
            className="ld-btn"
            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
          >
            🔄 Trocar câmara
          </button>
        </div>
      </div>
    )}
  </div>

  {/* ─── OUTROS SEPARADORES (ficam iguais) ─── */}
  {vistaAtiva === 'mensagens' && (
    <VistaMensagens
      conectado={conectado}
      enviar={enviar}
      smsThreads={smsThreads}
      smsMensagens={smsMensagens}
      smsSelecionado={smsSelecionado}
      setSmsSelecionado={setSmsSelecionado}
      smsInput={smsInput}
      setSmsInput={setSmsInput}
      smsLoading={smsLoading}
      setSmsLoading={setSmsLoading}
    />
  )}

  {vistaAtiva === 'chamadas' && (
    <VistaChamadas
      conectado={conectado}
      enviar={enviar}
      chamadas={chamadas}
      chamadasLoading={chamadasLoading}
      setChamadasLoading={setChamadasLoading}
      chamadaSelecionada={chamadaSelecionada}
      setChamadaSelecionada={setChamadaSelecionada}
    />
  )}

  {vistaAtiva === 'fotos' && (
    <VistaFotos
      conectado={conectado}
      enviar={enviar}
      fotos={fotos}
      fotosLoading={fotosLoading}
      setFotosLoading={setFotosLoading}
      fotoThumbs={fotoThumbs}
      fotoAberta={fotoAberta}
      setFotoAberta={setFotoAberta}
      fotoCarregando={fotoCarregando}
      setFotoCarregando={setFotoCarregando}
      fotoPreviewUrl={fotoPreviewUrl}
      setFotoPreviewUrl={setFotoPreviewUrl}
      fotoBytes={fotoBytes}
    />
  )}
</main>

          {modoTV && (
            <button
              onClick={() => setModoTV(false)}
              style={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 100000,
                padding: '10px 18px',
                background: 'rgba(255, 77, 94, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,77,94,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              ✕ Sair do Modo TV
            </button>
          )}

        </div>
      </div>
    </>
  );
}

export default App;