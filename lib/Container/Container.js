'use strict';
'use babel';

const fs = require('fs');
const path = require('path');

const UnknownParameterException = require('./Exceptions/UnknownParameterException');
const UnknownServiceException = require('./Exceptions/UnknownServiceException');
const FileNotFoundException = require('./Exceptions/FileNotFoundException');
const UnknownMethodException = require('./Exceptions/UnknownMethodException');

class Container
{
    constructor() {
        this.parameters = {};
        this.services = {};
        this.basePath = null;
    }

    /**
     * @method _loadFromFile
     * @param {string} settingsFile
     */
    static _loadFromFile(settingsFile) {
        try {
            return fs.readFileSync(settingsFile, 'utf8');
        } catch(e) {
            if (e.code === 'ENOENT') {
                throw new FileNotFoundException(settingsFile);
            }

            throw e;
        }
    }

    /**
     * @method _parseJsonSettings
     * @param {string} jsonSettings
     */
    static _parseJsonSettings(jsonSettings) {
        try {
            return JSON.parse(jsonSettings);
        } catch (e) {
            throw e;
        }
    }

    /**
     * @method _load
     * @param {string} settingsFile
     */
    static _load(settingsFile) {
        const jsonSettings = Container._loadFromFile(settingsFile);

        return Container._parseJsonSettings(jsonSettings);
    }

    /**
     * @method _manageSettings
     * @param {Object} settings
     */
    _manageSettings(settings) {
        if (settings.hasOwnProperty('parameters')) {
            this._setParameters(settings.parameters);
        }

        if (settings.hasOwnProperty('services')) {
            this._setServices(settings.services);
        }
    }

    /**
     * @method _setParameters
     * @param {Object} parametersList
     */
    _setParameters(parametersList) {
        for (const parameterName in parametersList) {
            if (parametersList.hasOwnProperty(parameterName)) {
                this._setParameter(parameterName, parametersList[parameterName]);
            }
        }
    }

    /**
     * @method _setParameter
     * @param {string} name
     * @param {string} value
     */
    _setParameter(name, value) {
        this.parameters[name] = value;
    }

    /**
     * @method _setServices
     * @param {Object} servicesList
     */
    _setServices(servicesList) {
        for (const serviceName in servicesList) {
            if (servicesList.hasOwnProperty(serviceName)) {
                this._setService(serviceName, servicesList[serviceName]);
            }
        }
    }

    /**
     * @method _setService
     * @param {string} name
     * @param {Object} serviceInformations
     */
    _setService(name, serviceInformations) {
        if (!serviceInformations.hasOwnProperty('class')) {
            throw 'no class set';
        }
        const classPath = this._transformElement(serviceInformations.class);
        const Class = require(path.join(this.basePath, classPath));
        const object = new Class();

        if (serviceInformations.hasOwnProperty('calls')) {
            for (let i = 0; i < serviceInformations.calls.length; i++) {
                if (object[serviceInformations.calls[i].method]) {
                    object[serviceInformations.calls[i].method]
                        .apply(object, this._transformElement(serviceInformations.calls[i].arguments));
                } else {
                    throw new UnknownMethodException(classPath, serviceInformations.calls[i].method);
                }
            }
        }

        this.services[name] = object;
    }

    _transform(string) {
        if (string.match(/\%.*\%/)) {
            return this.getParameter(string.match(/\%(.*)\%/)[1]);
        }

        if (string.match(/@.*/)) {
            return this.get(string.match(/@(.*)/)[1]);
        }

        return string;
    }

    /**
     * @method transformElement
     * @param {string} element
     *
     * @return {string|Object}
     */
    _transformElement(element) {
        if (typeof element === 'string') {
            return this._transform(element);
        } else if (element.length) {
            for (let i = 0; i < element.length; i++) {
                element[i] = this._transform(element[i]);
            }
        }

        return element;
    }

    /**
     * @method bootstrap
     * @param {string} settingsFile
     */
    bootstrap(settingsFile) {
        this.basePath = path.dirname(settingsFile);

        const settings = Container._load(settingsFile);

        this._manageSettings(settings);
    }

    /**
     * @method getParameter
     * @param {string} parameterName
     * @param {string} defaultValue
     *
     * @returns {string}
     * @throws UnknownParameterException
     */
    getParameter(parameterName, defaultValue) {
        if (this.parameters.hasOwnProperty(parameterName)) {
            return this.parameters[parameterName];
        }

        if (defaultValue) {
            return defaultValue;
        }

        throw new UnknownParameterException(parameterName);
    }

    /**
     * @method get
     * @param {string} serviceName
     *
     * @returns {Object}
     * @throws UnknownServiceException
     */
    get(serviceName) {
        if (this.services.hasOwnProperty(serviceName)) {
            return this.services[serviceName];
        }

        throw new UnknownServiceException(serviceName);
    }
}

module.exports = Container;
