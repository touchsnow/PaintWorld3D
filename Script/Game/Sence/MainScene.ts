import { _decorator, Node, LabelComponent, SpriteComponent } from 'cc';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import DialogManager from '../../../Framework3D/Src/Base/DialogManager';
import PlatformManager from '../../../Framework3D/Src/Base/PlatformManager';
import { BasePuzzleMainScene } from '../../../FrameworkModelPuzzle/Scene/BasePuzzleMainScene';
import StorgeManager from '../Manager/StorgeManager';
const { ccclass, property } = _decorator;

@ccclass('MainScene')
export class MainScene extends BasePuzzleMainScene {

    @property({
        type: Node,
        displayName: '钻石图',
    })
    diamonSprite: Node = null

    @property({
        type: LabelComponent,
        displayName: '钻石Label',
    })
    diamonLabel: LabelComponent = null

    @property({
        type: Node,
        displayName: '金币图',
    })
    coinSprite: Node = null

    @property({
        type: LabelComponent,
        displayName: '金币Label',
    })
    coinLabel: LabelComponent = null

    @property({
        type: Node,
        displayName: '金币节点',
    })
    coinNode: Node = null

    @property({
        type: Node,
        displayName: '钻石节点',
    })
    diamondNode: Node = null


    @property({
        type: Node,
        displayName: '设置按钮',
    })
    settingNode: Node = null

    @property({
        type: Node,
        displayName: '互推按钮',
    })
    navigateButton: Node = null

    @property(SpriteComponent)
    loadBar: SpriteComponent = null

    @property(LabelComponent)
    loadLabel: LabelComponent = null

    private navigetaState = false

    start() {
        super.start()
        this.diamonLabel.string = StorgeManager.getInstance().diamon.toString()
        this.coinLabel.string = StorgeManager.getInstance().cion.toString()
        this.node.on("AddCoin", this.addCoin, this)
        this.node.on("AddDiamond", this.addDiamond, this)
        this.node.on("ShowLoading", this.showLoading, this)
        this.coinNode.on(Node.EventType.TOUCH_END, this.onCoinNode, this)
        this.diamondNode.on(Node.EventType.TOUCH_END, this.onDiamondNode, this)
        this.settingNode.on(Node.EventType.TOUCH_END, this.onSettingNode, this)
        this.navigateButton.on(Node.EventType.TOUCH_END, this.onNavigateButton, this)
        //显示banner
        ASCAd.getInstance().hideBanner()
        ASCAd.getInstance().showBanner()
        ASCAd.getInstance().hideNativeIcon()
        
        if (PlatformManager.getInstance().isVivo()) {
            this.showNativeIcon()
        }
        else if (PlatformManager.getInstance().isOppo()) {
            //@ts-ignore
            if (qg.getSystemInfoSync().platformVersionCode >= 1076) {
                this.navigateButton.active = true
            }
            else {
                this.showNativeIcon()
            }
        }
        else {
            this.showNativeIcon()
        }
    }

    addCoin(num: number) {
        cc.tween(this.coinSprite)
            .to(0.05, { scale: cc.v3(1.2, 1.2, 1.2) })
            .to(0.05, { scale: cc.v3(1, 1, 1) })
            .call(() => {
                StorgeManager.getInstance().addCoin(num)
                this.coinLabel.string = StorgeManager.getInstance().cion.toString()
            })
            .start()
    }

    addDiamond(num: number) {
        cc.tween(this.diamonSprite)
            .to(0.05, { scale: cc.v3(1.2, 1.2, 1.2) })
            .to(0.05, { scale: cc.v3(1, 1, 1) })
            .call(() => {
                StorgeManager.getInstance().addDiamond(num)
                this.diamonLabel.string = StorgeManager.getInstance().diamon.toString()
            })
            .start()
    }

    showLoading() {
        this.loadBar.node.parent.active = true
        cc.tween(this.loadBar)
            .to(0.2, { fillRange: 0.3 })
            .to(0.4, { fillRange: 0.7 })
            .to(2, { fillRange: 0.9 })
            .start()

        cc.tween(this.node).repeatForever(cc.tween(this.node)
            .call(() => {
                this.loadLabel.string = "Loading " + (this.loadBar.fillRange * 100).toFixed(0) + "%"
            }).delay(0.1).start()).start()
    }

    onCoinNode() {
        let data = {
            tipTheme: "看视频获取金币"
        }
        DialogManager.getInstance().showDlg("ADTipDialog", data)
    }

    onDiamondNode() {
        let data = {
            tipTheme: "看视频获取钻石"
        }
        DialogManager.getInstance().showDlg("ADTipDialog", data)
    }

    onSettingNode() {
        DialogManager.getInstance().showDlg("SettingDialog")
    }

    onNavigateButton() {
        if (ASCAd.getInstance().getNavigateBoxPortalFlag()) {
            //展示互推盒子九宫格
            ASCAd.getInstance().showNavigateBoxPortal();
        }
    }

    showNativeIcon() {
        ASCAd.getInstance().hideNativeIcon()
        if (ASCAd.getInstance().getNativeIconFlag()) {
            ASCAd.getInstance().showNativeIcon(128, 128, (cc.winSize.width - 128) / 2 - 5 * cc.winSize.width / 720, (cc.winSize.height - 128) / 2 - 200 * cc.winSize.height / 1280)
        }
    }
}
