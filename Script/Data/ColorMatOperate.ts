import { _decorator, Component, Node, ModelComponent, loader } from 'cc';
import { BaseMatOperate } from './BaseMatOperate';
const { ccclass, property } = _decorator;

@ccclass('ColorMatOperate')
export class ColorMatOperate extends BaseMatOperate {

    start()
    {
        super.start()
    }

    recoverMat(matName:string)
    {
        let modelComt = this.node.getComponent(ModelComponent)
        let length = modelComt.materials.length
        for(let i = 0;i<length;i++)
        {
            modelComt.setMaterial(loader.getRes(matName),i)
            modelComt.materials[i].setProperty("ColorR", this.albedoScale[i].x)
            modelComt.materials[i].setProperty("ColorG", this.albedoScale[i].y)
            modelComt.materials[i].setProperty("ColorB", this.albedoScale[i].z)
        }
    }
}
