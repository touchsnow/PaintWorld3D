import { _decorator, Component, Node, Event, ModelComponent, loader, Prefab, director, Asset, SpriteComponent, CCBoolean } from 'cc';
import BaseLoadingScene from '../../../Framework3D/Src/Base/BaseLoadingScene';
import UIUtility from '../../../Framework3D/Src/Base/UIUtility';
import { ConfigManager } from '../Manager/ConfigManager';
import { LevelManager } from '../Manager/LevelManager';
import StorgeManager from '../Manager/StorgeManager';
const { ccclass, property } = _decorator;

@ccclass('LoadScene')
export class LoadScene extends BaseLoadingScene {

    @property({ type: SpriteComponent })
    progressSpriteBar: SpriteComponent = null

    @property({ type: CCBoolean })
    testMode: boolean = false

    

    start() {
        super.start()
        StorgeManager.getInstance().init()
        ConfigManager.getInstance().init()
    }

    onTouchButton(event: Event, data: any) {

    }

    onLoadResFinished() {
        if(this.testMode)
        {
            UIUtility.getInstance().loadScene('MainScene')
            return
        }
        if (StorgeManager.getInstance().getFinishedFlag("XinShouMen")) {
            director.preloadScene("GameScene")
            UIUtility.getInstance().loadScene('MainScene');
        }
        else {
            LevelManager.getInstance().set("XinShouMen", StorgeManager.getInstance().resetPaintArray("XinShouMen"))
            let resArray =
                [
                    LevelManager.getInstance().levelConfig.finishSkyBox,
                    LevelManager.getInstance().levelConfig.skyBox,
                    LevelManager.getInstance().levelConfig.environment,
                    "Model/XinShouMen"
                ]
            loader.loadResArray(resArray, Asset, () => {
                director.preloadScene("MainScene")
                UIUtility.getInstance().loadScene("GameScene")
            })
        }
    }

    setProgress(progress) {
        if (this.progressSpriteBar) {
            this.progressSpriteBar.fillRange = progress;
        }
        if(this.progressBar){
            this.progressBar.progress = progress
        }
        if (this.progressLabel) {
            this.progressLabel.string = `${(progress * 100).toFixed(2)}%`;
        }
    }
}

