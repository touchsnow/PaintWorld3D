import { _decorator, Component, Node, tween } from 'cc';
import { IAnim } from './IAnim';
const { ccclass, property } = _decorator;

@ccclass('XinShouMenAnim')
export class XinShouMenAnim extends IAnim {

    start() {
        this.nodeArray = [
            "ColorNumber::xinshoumen-Color-178-153-229::6",
            "ColorNumber::xinshoumen-Color-255-0-102::4",
        ]
    }

    playAnim(modelRoot: Node, evn: Node) {
        for (let i = 0; i < this.nodeArray.length; i++) {
            let node = modelRoot.getChildByName(this.nodeArray[i])
            if (node) {
                let pos = node.getWorldPosition()
                let rotate = node.getWorldRotation()
                node.setParent(this.node)
                node.setWorldPosition(pos)
                node.setWorldRotation(rotate)
            }
            node = evn.getChildByName(this.nodeArray[i])
            if (node) {
                let pos = node.getWorldPosition()
                let rotate = node.getWorldRotation()
                node.setParent(this.node)
                node.setWorldPosition(pos)
                node.setWorldRotation(rotate)

            }
        }

        let node = modelRoot.parent.getChildByPath("xinshoumen/MenAimePoint")
        if (node) {
            let pos = node.getWorldPosition()
            let rotate = node.getWorldRotation()
            node.setParent(this.node)
            node.setWorldPosition(pos)
            node.setWorldRotation(rotate)
        }

        // tween(this.node).repeatForever(tween(this.node)
        //     .to(2, { position: cc.v3(0, 0.015, 0) }, { easing: "quadInOut" })
        //     //.to(2, { position: cc.v3(0, -0.015, 0) }, { easing: "quadInOut" })
        //     .start()
        // ).start()
        //this.node.eulerAngles
        //this.node.setWorldRotationFromEuler(0, -104, 0)
        tween(this.node)
            .to(1, { eulerAngles: cc.v3(0, -104, 0) })
            .start()
    }

}
