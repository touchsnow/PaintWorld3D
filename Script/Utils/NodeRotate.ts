import { _decorator, Component, Node, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeRotate')
export class NodeRotate extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    tween: Tween = null

    start() {
        this.tween = cc.tween(this.node).repeatForever(cc.tween()
            .to(0.5, { eulerAngles: cc.v3(0,0,-20) }, { easing: "sineOut" })
            .to(0.5, { eulerAngles: cc.v3(0,0,20) }, { easing: "sineIn" })
            .to(0.2, { eulerAngles: cc.v3(0,0,-10) }, { easing: "sineOut" })
            .to(0.2, { eulerAngles: cc.v3(0,0,10) }, { easing: "sineIn" })
        ).start()
    }

    tweenStop() {
        if (this.tween) {
        } this.node.setRotationFromEuler(0, 0, 0)
        this.tween.stop()
    }

    tweenStart() {
        if (this.tween) {
            this.node.setRotationFromEuler(0, 0, 0)
            this.tween.start()
        }
    }
}
