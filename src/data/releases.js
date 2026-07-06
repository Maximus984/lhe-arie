// =====================================================
// MAXX FORGE STUDIO™ — Scheduled Maintenance & Releases
// Manages automated pre-scheduled update and maintenance cycles
// =====================================================

export const SCHEDULED_RELEASES = [
  {
    version: 'v4.1.0-Delta',
    title: 'Aries Cloud Integration & Google Calendar Sync',
    type: 'Update',
    scheduledTime: '2026-08-06T06:00:00.000Z', // Pushed forward — no longer triggers maintenance
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'Added Google Cloud storage node animation interface',
      'Interactive custom Discord-style role & permissions checklist manager',
      'OBS/TikTok Live Studio-style broadcaster dashboard',
      'Widescreen auto-scaling Live stream watch page with live chat',
      'Direct "+ Google Calendar" template sync link'
    ]
  },
  {
    version: 'v4.2.0-Alpha',
    title: 'Aries AI Chat Enhancement & Audio Core v2.0',
    type: 'Update',
    scheduledTime: '2026-08-01T12:00:00.000Z', // Pre-scheduled for next month
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'Multi-model LLM chat routing option (Local vs Network)',
      'Audio Waveform Visualizer customization controls',
      'Preset synth keymaps for the Aries Py-Arcade terminal'
    ]
  },
  {
    version: 'v4.3.0-Beta',
    title: 'Interactive Unity HORROR Sandbox Expansion',
    type: 'Update',
    scheduledTime: '2026-09-01T12:00:00.000Z',
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'Playable level 2: Cybernetic Boiler Room environment',
      'AI Stalker pathfinding upgrades & sound trigger telemetry',
      'Profile frame unlocks for survival completions'
    ]
  },
  {
    version: 'v4.4.0-Patch',
    title: 'Collectibles Chest Trade Protocol',
    type: 'Patch',
    scheduledTime: '2026-10-01T12:00:00.000Z',
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'P2P Collectible Badge trading sandbox',
      'Secure transaction verification logs',
      'Halloween theme visual loader integration'
    ]
  },
  {
    version: 'v4.5.0-Update',
    title: 'Aries Coder Python SDK Release',
    type: 'Update',
    scheduledTime: '2026-11-01T12:00:00.000Z',
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'Official pip install aries-coder SDK launch',
      'Local environment command-line verification script',
      'Custom API tokens key generator on dashboard'
    ]
  },
  {
    version: 'v4.6.0-Festival',
    title: 'Cozy Winter & Christmas Special Upgrade',
    type: 'Update',
    scheduledTime: '2026-12-01T12:00:00.000Z',
    maintenanceLeadMinutes: 10,
    status: 'scheduled',
    changes: [
      'Cozy snowfall physics particle upgrades',
      'Unlocking Christmas holiday badges in profile chest',
      'Founder New Year DJ Set live visualizer themes'
    ]
  }
];

export function initializeReleases() {
  const existing = localStorage.getItem('mfs_scheduled_releases');
  if (!existing) {
    localStorage.setItem('mfs_scheduled_releases', JSON.stringify(SCHEDULED_RELEASES));
  }
}

export function getScheduledReleases() {
  const data = localStorage.getItem('mfs_scheduled_releases');
  return data ? JSON.parse(data) : SCHEDULED_RELEASES;
}

export function saveScheduledReleases(releases) {
  localStorage.setItem('mfs_scheduled_releases', JSON.stringify(releases));
}

// Check if system should enter maintenance mode automatically
export function checkScheduledMaintenance() {
  const releases = getScheduledReleases();
  const now = new Date();
  
  for (const rel of releases) {
    const target = new Date(rel.scheduledTime);
    const timeDiffMs = target.getTime() - now.getTime();
    const leadMs = rel.maintenanceLeadMinutes * 60 * 1000;
    
    // 1. If currently inside the lead-up window (e.g. 5-10 minutes before)
    if (timeDiffMs > 0 && timeDiffMs <= leadMs) {
      const minutesRemaining = Math.ceil(timeDiffMs / (60 * 1000));
      return {
        isMaintenance: true,
        message: `SYSTEM UPGRADE IN PROGRESS: Aries OS version ${rel.version} is deploying. Systems going offline for compilation. Scheduled live in ${minutesRemaining} minute(s).`,
        release: rel
      };
    }
    
    // 2. If target has passed but status is still marked as scheduled (deploying state)
    if (timeDiffMs <= 0 && rel.status === 'scheduled') {
      // Auto-deploy: make it go live after 2 minutes or let the founder mark it as complete
      // Let's assume it automatically goes live after 30 seconds of target to keep it smooth
      const activeGracePeriodMs = 30 * 1000; 
      if (Math.abs(timeDiffMs) < activeGracePeriodMs) {
        return {
          isMaintenance: true,
          message: `SYSTEM UPGRADE IN PROGRESS: Finalizing deployment files for Aries OS ${rel.version}. Refreshing cache...`,
          release: rel
        };
      } else {
        // Automatically set to live once grace period ends
        rel.status = 'live';
        const updated = releases.map(r => r.version === rel.version ? { ...r, status: 'live' } : r);
        saveScheduledReleases(updated);
        // Return not maintenance anymore since it is now live!
      }
    }
  }
  
  return { isMaintenance: false };
}
