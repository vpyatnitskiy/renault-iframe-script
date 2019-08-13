import FrameManager from '../implementation/client'
import { getBrandedVariable } from '../implementation/brand'

window[getBrandedVariable()] = FrameManager
