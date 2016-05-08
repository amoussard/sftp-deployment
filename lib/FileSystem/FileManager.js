'use strict';
'use babel';

// @TODO: Refactor async

const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const File = require('./File');
const Directory = require('./Directory');

class FileManager
{
    getCurrentFile() {
        const deferred = Promise.pending();

        try {
            deferred.fulfill(new File(atom.workspace.paneContainer.activePane.activeItem.buffer.file.path));
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    getOpenFiles() {
        const deferred = Promise.pending();

        try {
            const files = [];
            const items = atom.workspace.getActivePane().getItems();

            for (const i in items) {
                if (items.hasOwnProperty(i)) {
                    files.push(new File(items[i].buffer.file.path));
                }
            }
            deferred.fulfill(files);
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    getSelection(deep) {
        const deferred = Promise.pending();

        try {
            const selectedPaths = atom.workspace.getLeftPanels()[0].getItem().selectedPaths();
            const files = [];

            for (const i in selectedPaths) {
                if (selectedPaths.hasOwnProperty(i)) {
                    this._treatPath(selectedPaths[i], files, deep);
                }
            }
            deferred.resolve(files);
        } catch(e) {
            deferred.reject(e);
        }

        return deferred.promise;
    }

    _treatPath(_path, results, deep) {
        const stats = fs.statSync(_path);

        if (stats.isDirectory()) {
            if (deep) {
                const files = fs.readdirSync(_path);

                for (const i in files) {
                    if (files.hasOwnProperty(i)) {
                        this._treatPath(path.join(_path, files[i]), results, deep);
                    }
                }
            } else {
                results.push(new Directory(_path));
            }
        } else if (results.indexOf(_path) < 0) {
            results.push(new File(_path));
        }
    }
}

module.exports = new FileManager();
