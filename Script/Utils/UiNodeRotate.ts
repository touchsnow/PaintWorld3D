import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiNodeRotate')
export class UiNodeRotate extends Component {

    start() {
        tween(this.node).repeatForever(tween(this.node)
            .call(() => {
                let eulerAngles = this.node.eulerAngles.clone()
                eulerAngles.z += 30
                this.node.setRotationFromEuler(eulerAngles.x, eulerAngles.y, eulerAngles.z)
            })
            .delay(0.1)
            .start())
            .start()
    }
}
