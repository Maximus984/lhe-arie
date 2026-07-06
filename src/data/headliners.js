// =====================================================
// MAXX FORGE STUDIO™ — Featured Music Headliners
// Tracks and albums rotated dynamically inside Prime Records
// =====================================================

export const HEADLINERS = [
  {
    id: 'headliner_ariana',
    artist: 'Ariana Grande',
    album: 'eternal sunshine deluxe: brighter days ahead',
    year: '2025',
    cover: '/audio/headliner_ariana/cover.jpg',
    accentColor: '#C084FC', // Light purple
    desc: 'Starting off our bi-weekly featured music headliner series with Ariana Grande\'s critically acclaimed "eternal sunshine deluxe: brighter days ahead". Enjoy high-fidelity audio streams direct from the Prime Records vault.',
    tracks: [
      { id: 101, title: 'intro (end of the world)', artist: 'Ariana Grande', src: '/audio/headliner_ariana/01. intro (end of the world) [Explicit].m4a', duration: '1:32' },
      { id: 102, title: 'bye', artist: 'Ariana Grande', src: '/audio/headliner_ariana/02. bye.m4a', duration: '2:44' },
      { id: 103, title: 'don\'t wanna break up again', artist: 'Ariana Grande', src: '/audio/headliner_ariana/03. don\'t wanna break up again [Explicit].m4a', duration: '2:54' },
      { id: 104, title: 'Saturn Returns Interlude', artist: 'Ariana Grande', src: '/audio/headliner_ariana/04. Saturn Returns Interlude.m4a', duration: '0:42' },
      { id: 105, title: 'eternal sunshine', artist: 'Ariana Grande', src: '/audio/headliner_ariana/05. eternal sunshine.m4a', duration: '3:30' },
      { id: 106, title: 'supernatural', artist: 'Ariana Grande', src: '/audio/headliner_ariana/06. supernatural.m4a', duration: '2:43' },
      { id: 107, title: 'true story', artist: 'Ariana Grande', src: '/audio/headliner_ariana/07. true story.m4a', duration: '2:50' },
      { id: 108, title: 'the boy is mine', artist: 'Ariana Grande', src: '/audio/headliner_ariana/08. the boy is mine [Explicit].m4a', duration: '2:53' },
      { id: 109, title: 'yes, and?', artist: 'Ariana Grande', src: '/audio/headliner_ariana/09. yes, and_ [Explicit].m4a', duration: '3:34' },
      { id: 110, title: 'we can\'t be friends (wait for your love)', artist: 'Ariana Grande', src: '/audio/headliner_ariana/10. we can\'t be friends (wait for your love).m4a', duration: '3:48' },
      { id: 111, title: 'i wish i hated you', artist: 'Ariana Grande', src: '/audio/headliner_ariana/11. i wish i hated you.m4a', duration: '2:33' },
      { id: 112, title: 'imperfect for you', artist: 'Ariana Grande', src: '/audio/headliner_ariana/12. imperfect for you [Explicit].m4a', duration: '3:02' },
      { id: 113, title: 'ordinary things (feat. Nonna)', artist: 'Ariana Grande', src: '/audio/headliner_ariana/13. ordinary things (feat. Nonna).m4a', duration: '2:46' },
      { id: 114, title: 'intro (end of the world) [extended]', artist: 'Ariana Grande', src: '/audio/headliner_ariana/14. intro (end of the world) [extended] [Explicit].m4a', duration: '2:58' },
      { id: 115, title: 'twilight zone', artist: 'Ariana Grande', src: '/audio/headliner_ariana/15. twilight zone.m4a', duration: '3:15' },
      { id: 116, title: 'warm', artist: 'Ariana Grande', src: '/audio/headliner_ariana/16. warm.m4a', duration: '3:20' },
      { id: 117, title: 'dandelion', artist: 'Ariana Grande', src: '/audio/headliner_ariana/17. dandelion.m4a', duration: '3:12' },
      { id: 118, title: 'past life', artist: 'Ariana Grande', src: '/audio/headliner_ariana/18. past life [Explicit].m4a', duration: '3:28' },
      { id: 119, title: 'Hampstead', artist: 'Ariana Grande', src: '/audio/headliner_ariana/19. Hampstead [Explicit].m4a', duration: '3:32' }
    ]
  },
  {
    id: 'headliner_djem',
    artist: 'DJ Em',
    album: 'Frequencies from the Neon Wall',
    year: '2026',
    cover: '/brand/logo.png',
    accentColor: '#10B981', // Moss green
    desc: 'Upcoming rotation headliner featuring DJ Em\'s absolute best stage performances, TouchDesigner sound telemetry tracks, and remix stems.',
    tracks: [
      { id: 1, title: 'Adrenaline Rush', artist: 'Maxx Forge', src: '/audio/album_dj_em/Adrenaline Rush.mp3', duration: '4:03' },
      { id: 2, title: 'Applied Physics', artist: 'Maxx Forge', src: '/audio/album_dj_em/Applied Physics.mp3', duration: '3:48' },
      { id: 3, title: 'Dark Queen', artist: 'Maxx Forge', src: '/audio/album_dj_em/Dark Queen.mp3', duration: '4:58' },
      { id: 4, title: 'Electric Whisper', artist: 'Maxx Forge', src: '/audio/album_dj_em/Electric Whisper.mp3', duration: '4:07' },
      { id: 5, title: 'Shadow Dance', artist: 'Maxx Forge', src: '/audio/album_dj_em/Shadow Dance (1).mp3', duration: '4:37' },
      { id: 6, title: 'Off The Record', artist: 'Maxx Forge', src: '/audio/album_dj_em/Off_the_Record_20260121_1331.mp3', duration: '5:23' },
      { id: 7, title: 'User Error', artist: 'Maxx Forge', src: '/audio/album_dj_em/USER_ERROR_20260121_1228.mp3', duration: '3:39' }
    ]
  }
];

export function getActiveHeadliner() {
  // Let the user switch or automatically return first (Ariana)
  const saved = localStorage.getItem('mfs_active_headliner');
  const index = saved ? parseInt(saved) : 0;
  return HEADLINERS[index] || HEADLINERS[0];
}

export function rotateHeadliner() {
  const current = localStorage.getItem('mfs_active_headliner');
  const nextIndex = current === '0' ? 1 : 0;
  localStorage.setItem('mfs_active_headliner', String(nextIndex));
  return HEADLINERS[nextIndex];
}
