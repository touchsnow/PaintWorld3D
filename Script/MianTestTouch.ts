import { _decorator, Component, Node } from 'cc';
import { LevelManager } from './Game/Manager/LevelManager';
import UIUtility from '../Framework3D/Src/Base/UIUtility';
const { ccclass, property } = _decorator;

@ccclass('MianTestTouch')
export class MianTestTouch extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        this.node.on(Node.EventType.TOUCH_END,this.onTouch,this)
    }

    onTouch()
    {
        LevelManager.getInstance().set(this.node.name,UIUtility.getInstance().loadScene('GameScene'))
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
