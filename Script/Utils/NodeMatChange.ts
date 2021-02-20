import { _decorator, Component, Node, Material, ModelComponent, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeMatChange')
export class NodeMatChange extends Component {

    @property(Material)
    mat: Material = null

    start() {
        this.changeMat()
    }

    changeMat() {
        this.node.children.forEach(element => {
            let model = element.getComponent(ModelComponent)
            if (model) {
                for (let i = 0; i < model.materials.length; i++) {
                    let albedoSacle =  model.materials[i].getProperty("albedoScale", 0) as Vec3
                    model.setMaterial(this.mat, i)
                    model.materials[i].setProperty("ColorR", albedoSacle.x)
                    model.materials[i].setProperty("ColorG", albedoSacle.y)
                    model.materials[i].setProperty("ColorB", albedoSacle.z)
                }
            }
        })
    }
}
