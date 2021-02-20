import { _decorator, Component, Node, tween } from 'cc';
import BaseDialog from '../../../Framework3D/Src/Base/BaseDialog';
import DialogManager from '../../../Framework3D/Src/Base/DialogManager';
const { ccclass, property } = _decorator;

@ccclass('ExbihitionLoadingDialog')
export class ExbihitionLoadingDialog extends BaseDialog {

    @property(Node)
    loading: Node = null

    start() {
        super.start()
        tween(this.loading).repeatForever(tween(this.loading)
            .call(() => {
                let eulerAngles = this.loading.eulerAngles.clone()
                eulerAngles.y += 30
                this.loading.setRotationFromEuler(eulerAngles.x, eulerAngles.y, eulerAngles.z)
            })
            .delay(0.1)
            .start()
        )
    }
}
