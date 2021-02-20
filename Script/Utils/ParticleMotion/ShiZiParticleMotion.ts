import { _decorator, Component, Node, CCInteger, Vec3, ParticleSystemComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShiZiParticleMotion')
export class ShiZiParticleMotion extends Component {
    @property(CCInteger)
    delayTime: number = 0

    intervalTime: number = 0

    @property(CCInteger)
    moveScaleX: number = 0

    @property(CCInteger)
    moveScaleY: number = 0

    @property(CCInteger)
    moveScaleZ: number = 0

    private startPalyAnim: boolean = false

    private originalPos: Vec3 = new Vec3()

    private timer: number = 0

    start() {
        let delay = Math.random()*this.delayTime
        this.intervalTime = Math.random()*3
        this.node.active = false
        this.originalPos = this.node.getWorldPosition().clone()
        this.scheduleOnce(() => {
            this.startPalyAnim = true
            this.node.active = true
        }, delay)
    }

    update(dt: number) {
        if (this.startPalyAnim) {
            if (this.timer === 0) {
                this.node.getComponent(ParticleSystemComponent).play()
            }
            this.timer += dt
            this.node.setWorldPosition(cc.v3(this.node.worldPosition.x + Math.sin(this.timer * 2) * this.moveScaleX, this.node.worldPosition.y + Math.sin(this.timer * 2) * this.moveScaleY, this.node.worldPosition.z+ Math.sin(this.timer * 2)*this.moveScaleX))
            if (this.timer >= 5) {
                this.node.getComponent(ParticleSystemComponent).stop()
                this.node.setWorldPosition(this.originalPos)
                this.timer = 0
                this.startPalyAnim= false
                this.scheduleOnce(()=>{
                    this.startPalyAnim = true
                },this.intervalTime)
            }
        }

    }
}
