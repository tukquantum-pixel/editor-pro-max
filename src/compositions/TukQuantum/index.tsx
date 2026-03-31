import {AbsoluteFill, Sequence} from "remotion";
import {loadDefaultFonts} from "../../presets/fonts";
import {ProgressBar} from "../../components/overlays/ProgressBar";
import {Scene1Hook} from "./Scene1_Hook";
import {Scene2Traditional} from "./Scene2_Traditional";
import {Scene3Nosotros} from "./Scene3_Nosotros";
import {Scene4Agents} from "./Scene4_Agents";
import {Scene5BeatDrop} from "./Scene5_BeatDrop";
import {Scene6Montage} from "./Scene6_Montage";
import {Scene7Logo} from "./Scene7_Logo";
import {Scene8CTA} from "./Scene8_CTA";

// 30 seconds @ 30fps = 900 frames
// Scene timings (frames):
// 0:00-0:03 = 0-90    Scene 1: Hook
// 0:03-0:06 = 90-180  Scene 2: Traditional consulting
// 0:06-0:09 = 180-270 Scene 3: Nosotros?
// 0:09-0:12 = 270-360 Scene 4: 700 AI agents
// 0:12-0:15 = 360-450 Scene 5: Beat drop - 3 días
// 0:15-0:20 = 450-600 Scene 6: Sector montage
// 0:20-0:25 = 600-750 Scene 7: TUK logo
// 0:25-0:30 = 750-900 Scene 8: CTA + fade

export const TukQuantumVideo: React.FC = () => {
  loadDefaultFonts();

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1Hook />
      </Sequence>

      <Sequence from={90} durationInFrames={90}>
        <Scene2Traditional />
      </Sequence>

      <Sequence from={180} durationInFrames={90}>
        <Scene3Nosotros />
      </Sequence>

      <Sequence from={270} durationInFrames={90}>
        <Scene4Agents />
      </Sequence>

      <Sequence from={360} durationInFrames={90}>
        <Scene5BeatDrop />
      </Sequence>

      <Sequence from={450} durationInFrames={150}>
        <Scene6Montage />
      </Sequence>

      <Sequence from={600} durationInFrames={150}>
        <Scene7Logo />
      </Sequence>

      <Sequence from={750} durationInFrames={150}>
        <Scene8CTA />
      </Sequence>

      {/* Progress bar */}
      <ProgressBar color="#06f5d0" height={3} position="bottom" />
    </AbsoluteFill>
  );
};
