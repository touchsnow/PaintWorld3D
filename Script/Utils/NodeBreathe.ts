import { _decorator, Component, Node, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeBreathe')
export class NodeBreathe extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    tween: Tween = null

    start() {
        this.tween = cc.tween(this.node).repeatForever(cc.tween()
            .to(0.5, { scale: cc.v3(1.05, 1.05, 1.05) }, { easing: "sineOut" })
            .to(0.5, { scale: cc.v3(1, 1, 1) }, { easing: "sineIn" })
        ).start()
    }

    tweenStop() {
        if (this.tween) {

        } this.node.setScale(1, 1, 1)
        this.tween.stop()
    }

    tweenStart() {
        if (this.tween) {
            this.node.setScale(1, 1, 1)
            this.tween.start()
        }
    }

}
