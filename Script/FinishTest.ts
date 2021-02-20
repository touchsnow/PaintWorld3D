import { _decorator, Component, Node, find } from 'cc';
import { GameManager } from './Game/Manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('FinishTest')
export class FinishTest extends Component {

    @property(Node)
    controlNode:Node = null



    start () {
        this.node.on(Node.EventType.TOUCH_END,this.onTouch,this)
        this.controlNode.on(Node.EventType.TOUCH_END,this.finish,this)
    }


    onTouch()
    {
        if(this.controlNode.active === true)
        {
            this.controlNode.active = false
        }
        else
        {
            this.controlNode.active =true
        }
    }

    finish()
    {
        find("GameManagers").getComponent(GameManager).YiJianTongGunag()
    }
}
