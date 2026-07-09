import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Send, Check, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      reported: false,
      reporting: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Ecosystem rendering error captured:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Auto-log to console
    try {
      const logs = JSON.parse(localStorage.getItem('mfs_session_logs') || '[]');
      const errorLog = {
        id: `err_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: 'SECURITY_ALERT',
        event: 'UI Crash Captured',
        details: {
          message: error.message,
          stack: error.stack?.substring(0, 300)
        },
        ip: localStorage.getItem('mfs_simulated_ip') || '127.0.0.1',
        userAgent: navigator.userAgent
      };
      localStorage.setItem('mfs_session_logs', JSON.stringify([errorLog, ...logs].slice(0, 100)));
    } catch (_) {}
  }

  handleReport = async () => {
    const { submitForm, currentUser } = this.props;
    const { error } = this.state;
    
    if (this.state.reported) return;
    
    this.setState({ reporting: true });
    
    try {
      const reportData = {
        formType: 'bug_report',
        type: 'Bug Report',
        submittedBy: currentUser?.name || currentUser?.displayName || 'Anonymous Guest',
        submittedByEmail: currentUser?.email || 'guest@maxxforge.temp',
        data: {
          errorMessage: error?.message || 'Unknown render exception',
          errorStack: error?.stack || 'No stack trace details.',
          urlPath: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      submitForm(reportData);
      
      await new Promise(r => setTimeout(r, 800)); // Smooth feedback wait
      this.setState({ reported: true, reporting: false });
      toast.success('Bug report successfully routed to founder console.');
    } catch (err) {
      this.setState({ reporting: false });
      toast.error('Failed to transmit bug report.');
      console.error(err);
    }
  };

  handleRepair = () => {
    try {
      // Clear non-critical local storage keys to restore stable configurations
      const preservedKeys = ['mfs_session', 'mfs_users', 'mfs_simulated_ip'];
      
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !preservedKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(k => localStorage.removeItem(k));
      toast.success('Transient settings repaired. Rebooting enclaves...');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, reported, reporting, showDetails } = this.state;
      return (
        <div style={styles.container}>
          <div style={styles.noise} />
          
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={styles.glow}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={styles.card}
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.iconContainer}>
                <ShieldAlert size={28} color="#EF4444" className="animate-pulse" />
              </div>
              <h2 style={styles.title}>System Telemetry Fault</h2>
              <p style={styles.subtitle}>Aries OS detected a runtime render exception.</p>
            </div>

            {/* Error Message */}
            <div style={styles.errorBox}>
              <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={styles.errorTitle}>EXCEPTION DETECTED:</span>
                <span style={styles.errorMsg}>{error?.message || 'TypeError: Failed to execute render hook'}</span>
              </div>
            </div>

            {/* Toggle Stacktrace */}
            <div style={{ alignSelf: 'stretch' }}>
              <button 
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={styles.detailsBtn}
              >
                <span>{showDetails ? 'Hide Stack Telemetry' : 'View Stack Telemetry'}</span>
                {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={styles.stacktrace}
                  >
                    <pre style={styles.pre}>
                      {error?.stack || 'No traceback trace hydrations detected.'}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form submission question */}
            <div style={styles.proposalBox}>
              <p style={styles.proposalText}>
                Hey, would you like to report this bug? It will be sent directly to the Admin Dashboard.
              </p>
              <button
                onClick={this.handleReport}
                disabled={reported || reporting}
                style={{
                  ...styles.reportBtn,
                  background: reported ? 'rgba(16,185,129,0.1)' : 'rgba(0, 229, 255, 0.1)',
                  borderColor: reported ? 'rgba(16,185,129,0.3)' : 'rgba(0, 229, 255, 0.3)',
                  color: reported ? '#10B981' : '#00E5FF',
                  cursor: (reported || reporting) ? 'not-allowed' : 'pointer'
                }}
              >
                {reporting ? (
                  <div style={styles.spinner} />
                ) : reported ? (
                  <>
                    <Check size={12} /> REPORTED ✓
                  </>
                ) : (
                  <>
                    <Send size={12} /> TRANSMIT REPORT
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button onClick={this.handleRepair} style={styles.repairBtn}>
                <RefreshCw size={13} /> REPAIR & RELOAD WEBSITE
              </button>
            </div>
            <p style={styles.infoText}>
              Wiping transient configuration caches. Main credentials and session enclaves will be preserved.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function EcosystemErrorBoundary({ children }) {
  const { submitForm, currentUser } = useAuth();
  return (
    <ErrorBoundaryInner submitForm={submitForm} currentUser={currentUser}>
      {children}
    </ErrorBoundaryInner>
  );
}

const styles = {
  container: {
    position: 'fixed', inset: 0, zIndex: 999999,
    background: '#07070a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    padding: '20px', overflow: 'hidden'
  },
  noise: {
    position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
  },
  glow: {
    position: 'absolute', width: '550px', height: '550px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
    pointerEvents: 'none'
  },
  card: {
    width: '100%', maxWidth: '440px',
    backgroundColor: 'rgba(15,14,18,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px', padding: '30px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
  },
  header: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  iconContainer: {
    width: '56px', height: '56px', borderRadius: '16px',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px'
  },
  title: { fontSize: '18px', fontWeight: '800', tracking: '0.04em', color: '#fff', margin: 0 },
  subtitle: { fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'monospace' },
  errorBox: {
    alignSelf: 'stretch', display: 'flex', gap: '10px',
    backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
    borderRadius: '12px', padding: '12px 14px', textAlign: 'left'
  },
  errorTitle: { fontSize: '9px', fontFamily: 'monospace', fontWeight: '800', color: '#EF4444', letterSpacing: '0.08em' },
  errorMsg: { fontSize: '11px', fontFamily: 'monospace', color: '#fca5a5', lineHeight: '1.4', wordBreak: 'break-all' },
  detailsBtn: {
    display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center',
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
    fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer',
    padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  stacktrace: {
    alignSelf: 'stretch', maxHeight: '120px', overflowY: 'auto',
    backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '10px', padding: '10px', marginTop: '8px'
  },
  pre: { margin: 0, fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
  proposalBox: {
    alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '12px', padding: '12px 14px', textAlign: 'left'
  },
  proposalText: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '1.4' },
  reportBtn: {
    alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '8px', border: '1px solid',
    fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold', transition: 'all 0.2s'
  },
  spinner: { width: '10px', height: '10px', border: '1.5px solid rgba(255,255,255,0.2)', borderTop: '1.5px solid currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  actions: { alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '8px' },
  repairBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#fff', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 2px 12px rgba(16,185,129,0.2)', transition: 'all 0.2s'
  },
  infoText: { fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0, textAlign: 'center' }
};
