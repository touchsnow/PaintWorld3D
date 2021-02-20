import { _decorator, Component, Node, Vec2, Quat, find, CameraComponent, geometry, Enum, CCInteger, Vec3, math, AudioClip } from 'cc';
import AudioManager from '../../Framework3D/Src/Base/AudioManager';
import BaseScene from '../../Framework3D/Src/Base/BaseScene';
const { ccclass, property } = _decorator;

enum TouchState {
    NONE,
    MOVE
}
@ccclass('BasePuzzleGameScene')
export class BasePuzzleGameScene extends BaseScene {

    protected v2_1 = new Vec2()
    protected v2_2 = new Vec2()
    protected qt_1 = new Quat()
    protected TouchStates = Enum(TouchState);


    @property({
        type: Node,
        displayName: '模型根节点',
        tooltip: '旋转模型的节点'

    })
    rotateAxis: Node = null


    @property({
        type: CCInteger,
        displayName: '滑动速度',
        tooltip: '滑动时模型的旋转速度'

    })
    rotateSpeed = 10;

    /**触摸状态 */
    protected touchState = null

    /**双指触摸距离 */
    private touchDis:number = 0

    @property({
        type: CameraComponent,
        displayName: '特效摄像机',
    })
    effectCamera: CameraComponent = null

    @property({
        type: CameraComponent,
        displayName: '主摄像机',
    })
    mainCamera: CameraComponent = null

    @property({
        type: CameraComponent,
        displayName: '天空盒摄像机',
    })
    skyBoxCamera: CameraComponent = null


    /**相机射线 */
    protected ray: geometry.ray = new geometry.ray()

    @property([AudioClip])
    audioList = []


    start() {
        super.start()
        this.touchState = this.TouchStates.NONE
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
        //播放随机音乐
        let index = Math.floor(Math.random()*this.audioList.length)         
        AudioManager.getInstance().playMusic(this.audioList[index], true);
    }

    onTouchMove(e) {
        if (e.getTouches().length === 1) {
            e.getStartLocation(this.v2_1)
            e.getDelta(this.v2_2)
            Quat.fromEuler(this.qt_1, -this.v2_2.y * this.rotateSpeed * 0.1, 0, 0)
            this.rotateAxis.rotate(this.qt_1, Node.NodeSpace.LOCAL)
            Quat.fromEuler(this.qt_1, 0, -this.v2_2.x * this.rotateSpeed * 0.1, 0)
            this.rotateAxis.rotate(this.qt_1, Node.NodeSpace.WORLD)
            if (this.rotateAxis.eulerAngles.x >= 90) {
                this.rotateAxis.setWorldRotationFromEuler(90, this.rotateAxis.eulerAngles.y, this.rotateAxis.eulerAngles.z)
            }
            if (this.rotateAxis.eulerAngles.x <= 0) {
                this.rotateAxis.setWorldRotationFromEuler(0, this.rotateAxis.eulerAngles.y, this.rotateAxis.eulerAngles.z)
            }
            if (this.v2_2.x !== 0 && this.v2_2.y !== 0) {
                this.touchState = this.TouchStates.MOVE
            }
        }
        if(e.getTouches().length === 2)
        {
            let touch1 = e.getTouches()[0]
            let touch2 = e.getTouches()[1]
            let pos1 = touch1.getLocation()
            let pos2 = touch2.getLocation()
            let newTouchDis = Vec2.distance(pos1,pos2)
            if(this.touchDis!==0)
            {
                this.setCameraDistant((newTouchDis-this.touchDis)*0.0005)
            }
            this.touchDis = newTouchDis
            let v2_1 = new Vec2()
            let v2_2 = new Vec2()
            touch1.getDelta(v2_1)
            touch2.getDelta(v2_2)
            if(v2_1.x>0&& v2_2.x>0)
            {
                const result = new Vec3(1, 0, 0)
                math.Vec3.transformQuat(result, result, this.rotateAxis.getRotation())
                let moveDelta = Math.abs(v2_1.x + v2_2.x)
                let pos = this.rotateAxis.getPosition()
                pos.add(result.multiplyScalar(0.00005*moveDelta))
                this.rotateAxis.setPosition(pos)
            }
            if(v2_1.x<0&& v2_2.x<0)
            {
                const result = new Vec3(-1, 0, 0)
                math.Vec3.transformQuat(result, result, this.rotateAxis.getRotation())
                let moveDelta = Math.abs(v2_1.x + v2_2.x) 
                let pos = this.rotateAxis.getPosition()
                pos.add(result.multiplyScalar(0.00005*moveDelta))
                this.rotateAxis.setPosition(pos)
            }
            if(v2_1.y>0&& v2_2.y>0)
            {
                const result = new Vec3(0, -1, 0)
                math.Vec3.transformQuat(result, result, this.rotateAxis.getRotation())
                let moveDelta = Math.abs(v2_1.y + v2_2.y) 
                let pos = this.rotateAxis.getPosition()
                pos.add(result.multiplyScalar(0.00005*moveDelta))
                this.rotateAxis.setPosition(pos)
            }
            if(v2_1.y<0&& v2_2.y<0)
            {
                const result = new Vec3(0, 1, 0)
                math.Vec3.transformQuat(result, result, this.rotateAxis.getRotation())
                let moveDelta = Math.abs(v2_1.y + v2_2.y)
                let pos = this.rotateAxis.getPosition()
                pos.add(result.multiplyScalar(0.00005*moveDelta))
                this.rotateAxis.setPosition(pos)
            }
            this.touchState = this.TouchStates.MOVE
        }
    }

    onTouchEnd(e) {
        this.touchDis = 0
    }

    setCameraDistant(delta:number)
    {
        this.mainCamera.node.setPosition(cc.v3(0,0,this.mainCamera.node.position.z+delta))
        if(this.mainCamera.node.position.z>-0.1)
        {
            this.mainCamera.node.setPosition(cc.v3(0,0,-0.1))
        }
        if(this.mainCamera.node.position.z<-0.9)
        {
            this.mainCamera.node.setPosition(cc.v3(0,0,-0.9))
        }
        this.effectCamera.node.setPosition(cc.v3(0,0,this.mainCamera.node.position.z+delta))
        if(this.effectCamera.node.position.z>-0.1)
        {
            this.effectCamera.node.setPosition(cc.v3(0,0,-0.1))
        }
        if(this.effectCamera.node.position.z<-0.9)
        {
            this.effectCamera.node.setPosition(cc.v3(0,0,-0.9))
        }
    }
}
