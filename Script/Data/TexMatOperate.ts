import { _decorator, Component, Node, Material, ModelComponent, loader } from 'cc';
import { BaseMatOperate } from './BaseMatOperate';
const { ccclass, property } = _decorator;

@ccclass('TexMatOperate')
export class TexMatOperate extends BaseMatOperate {

    private recoverMaterial:Material = null

    start () {
        super.start()
        this.recoverMaterial = this.node.getComponent(ModelComponent).getMaterial(0)
    }

    recoverMat(matName:string)
    {
        if(matName.indexOf("ReflectPlane")!== -1)
        {
            let modelComt = this.node.getComponent(ModelComponent)
            let length = modelComt.materials.length
            for(let i = 0;i<length;i++)
            {
                modelComt.setMaterial(loader.getRes(matName),i)
            }
        }
        else
        {
            this.node.getComponent(ModelComponent).setMaterial(this.recoverMaterial,0)
        }
    }

}
