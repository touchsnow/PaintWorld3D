import { _decorator, Component, Node } from 'cc';
import UIUtility from '../Framework3D/Src/Base/UIUtility';
const { ccclass, property } = _decorator;

@ccclass('GameTestTouch')
export class GameTestTouch extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        this.node.on(Node.EventType.TOUCH_END,this.onTouchEnd,this)
    }

    onTouchEnd()
    {
        UIUtility.getInstance().loadScene('MainScene');
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
