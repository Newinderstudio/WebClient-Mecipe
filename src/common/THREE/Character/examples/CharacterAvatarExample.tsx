import { useState, useMemo } from 'react';
import CharacterAvatar from '../CharacterAvatar';
import { ControllerFactory, ControllerType } from '../controllers';

export default function CharacterAvatarExample() {
  const [controllerType, setControllerType] = useState<ControllerType>('keyboard');

  const controller = useMemo(() => {
    return ControllerFactory.createController({
      type: controllerType,
      websocketUrl: controllerType === 'websocket' ? 'ws://localhost:8080' : undefined,
    });
  }, [controllerType]);

  return (
    <div>
      {/* 컨트롤러 선택 UI */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <label>
          <input
            type="radio"
            value="keyboard"
            checked={controllerType === 'keyboard'}
            onChange={(e) => setControllerType(e.target.value as ControllerType)}
          />
          키보드 컨트롤
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value="websocket"
            checked={controllerType === 'websocket'}
            onChange={(e) => setControllerType(e.target.value as ControllerType)}
          />
          웹소켓 컨트롤
        </label>
      </div>

      {/* 3D 씬 */}
      <CharacterAvatar
        gltfPath="/3d/test_virtual_world/virtual_world.glb"
        isDraco={true}
        controller={controller}
      />
    </div>
  );
}
