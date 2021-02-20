import { _decorator, Component, Node, loader, ModelComponent, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseMatOperate')
export class BaseMatOperate extends Component {

    /**材质球数量 */
    protected matLenght = 0

    /**albedoScale */
    protected albedoScale:Array<Vec3> = []

    start() {
        this.matLenght = this.node.getComponent(ModelComponent).materials.length
        for(let i =0;i<this.matLenght;i++)
        {
            this.albedoScale.push(this.node.getComponent(ModelComponent).materials[i].getProperty("albedoScale", 0) as Vec3)
        }
    }

    initMat(garyValue:Vec3 ) {
        let modelComt = this.node.getComponent(ModelComponent)
        for (let i = 0; i < this.matLenght; i++) {
            modelComt.setMaterial(loader.getRes("Mat/UnPaint"), i)
            modelComt.materials[i].setProperty("albedoScale", garyValue)
        }
    }

    recoverMat(matName:string) {}

    paintingMat(moveX: number, moveY: number, hue: number) {
        let modelComt = this.node.getComponent(ModelComponent)
        for (let i = 0; i < this.matLenght; i++) {
            modelComt.setMaterial(loader.getRes("Mat/Painting"), i)
            modelComt.materials[i].setProperty("MoveDirtX", moveX)
            modelComt.materials[i].setProperty("MoveDirtY", moveY)
            modelComt.materials[i].setProperty("Hue", hue)
        }
    }

    promoty(size: number) {

        let modelComt = this.node.getComponent(ModelComponent)
        modelComt.material = loader.getRes("Mat/Promoty")
        modelComt.material.setProperty("tilingOffset", cc.v4(0.00025 / size, 0.00025 / size, 0, 0))

    }

}
