import { _decorator, Component, Node, tween } from 'cc';
import { IAnim } from './IAnim';
const { ccclass, property } = _decorator;

@ccclass('JiCheNvHaiAnim')
export class JiCheNvHaiAnim extends IAnim {

    start() {
        this.nodeArray = [
            "ColorNumber::feixingmao1::0",
            "ColorNumber::feixingmao2::16",
            "ColorNumber::feixingmao3::2",
            "ColorNumber::feixingmao6::9",
            "ColorNumber::feixingmao7::10",
            "ColorNumber::feixingmao5::22",
            "ColorNumber::feixingmao8::24",
            "ColorNumber::feixingmao9::23",
            "JiCheNvHai_1",
            "JiCheNvHai_2",
        ]
    }

    playAnim(modelRoot: Node, evn: Node) {
        for (let i = 0; i < this.nodeArray.length; i++) {
            let node = modelRoot.getChildByName(this.nodeArray[i])
            if (node) {
                let pos = node.getWorldPosition()
                node.setParent(this.node)
                node.setWorldPosition(pos)
            }
            node = evn.getChildByName(this.nodeArray[i])
            if (node) {
                let pos = node.getWorldPosition()
                node.setParent(this.node)
                node.setWorldPosition(pos)
            }
        }
        
        tween(this.node).repeatForever(tween(this.node)
            .to(2, { position: cc.v3(0, 0.035, 0) }, { easing: "quadInOut" })
            .to(2, { position: cc.v3(0, -0.015, 0) }, { easing: "quadInOut" })
            .start()
        ).start()
    }
}
