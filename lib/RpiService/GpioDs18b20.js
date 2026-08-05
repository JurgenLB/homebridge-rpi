// homebridge-rpi/lib/RpiService/GpioInput/GpioDs18b20.js
// Copyright © 2019-2026 Erik Baauw.  All rights reserved.
//
// Homebridge plugin for Raspberry Pi.

import { ServiceDelegate } from 'homebridge-lib/ServiceDelegate'

import { RpiService } from '../RpiService.js'

class GpioDs18b20 extends ServiceDelegate {
  constructor (gpioAccessory, params = {}) {
    params.name = gpioAccessory.name + ' Temperature'
    params.Service = gpioAccessory.Services.hap.TemperatureSensor
    super(gpioAccessory, params)
    this.pi = gpioAccessory.pi
    this.params = params
    this.fileName = params.fileName
    this.gpioAccessory = gpioAccessory

    this.addCharacteristicDelegate({
      key: 'temperature',
      Characteristic: this.Characteristics.eve.CurrentTemperature,
      unit: '°C'
    })
    this.addCharacteristicDelegate({
      key: 'temperatureUnit',
      Characteristic: this.Characteristics.hap.TemperatureDisplayUnits,
      value: this.Characteristics.hap.TemperatureDisplayUnits.CELSIUS
    })
    this.addCharacteristicDelegate({
      key: 'lastUpdated',
      Characteristic: this.Characteristics.my.LastUpdated,
      silent: true
    })
    this.addCharacteristicDelegate({
      key: 'statusFault',
      Characteristic: this.Characteristics.hap.StatusFault,
      silent: true
    })
  }

  async heartbeat (beat) {
    try {
      if (!this.pi.connected || this.inHeartbeat) {
        return
      }
      this.inHeartbeat = true
      if (beat % 5 === 0) {
        const temperature = await this.pi.readFile(this.fileName)
        this.values.temperature = Math.round(parseInt(temperature) / 10) / 100
        this.values.lastUpdated = String(new Date()).slice(0, 24)
      }
      this.inHeartbeat = false
    } catch (error) {
      this.inHeartbeat = false
      this.warn('heartbeat error %s', error)
    }
  }

  async init () { }

  async shutdown () { }
}

RpiService.GpioDs18b20 = GpioDs18b20
