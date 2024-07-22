// import React, { createContext, useState, useContext, useEffect } from 'react';
// import Sound from 'react-native-sound';

// const CallSoundContext = createContext();

// export const CallSoundProvider = ({ children }) => {
//   const [callSound, setCallSound] = useState(null);

//   useEffect(() => {
//     const sound = new Sound(require("./assets/sound/ring.mp3"), Sound.MAIN_BUNDLE, error => {
//       if (error) {
//         console.log('Error loading sound file:', error);
//         return;
//       }
//       setCallSound(sound);
//     });

//     return () => {
//       if (sound) {
//         sound.release();
//       }
//     };
//   }, []);

//   return (
//     <CallSoundContext.Provider value={callSound}>
//       {children}
//     </CallSoundContext.Provider>
//   );
// };

// export const useCallSound = () => useContext(CallSoundContext);
