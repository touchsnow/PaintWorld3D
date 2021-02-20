import { _decorator, Component, Node, Vec3, ParticleSystemComponent, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleMotion')
export class ParticleMotion extends Component {

    @property(CCInteger)
    moveTime:number = 0

    @property(CCInteger)
    moveScaleX:number = 0

    
    @property(CCInteger)
    moveScaleY:number = 0

    
    @property(CCInteger)
    moveScaleZ:number = 0

    private originalPos:Vec3 = new Vec3()

    start () {
        this.node.active =false
        let delay = Math.random()*5
        let originalPos = this.node.getWorldPosition().clone()
        this.scheduleOnce(()=>{
            cc.tween(this.node).repeatForever(cc.tween(this.node)
            .call(()=>{
                this.node.active = true
                this.node.getComponent(ParticleSystemComponent).play()
            })
            .to(this.moveTime,{worldPosition:cc.v3(originalPos.x+Math.random()*this.moveScaleX,originalPos.y+Math.random()*this.moveScaleY,originalPos.z+Math.random()*this.moveScaleZ)})
            .call(()=>{
                this.node.getComponent(ParticleSystemComponent).stop()
                this.node.active = false
                this.node.setWorldPosition(originalPos)
            })
            .delay(1.5)
            .start()).start()
        },delay)
    }
}
