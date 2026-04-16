/*!
 * MIT License
 *
 * Copyright (c) 2023 SiYuan 思源笔记
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
"use strict";
var o = require("siyuan");
var Plugin = o.Plugin;
var STORAGE_KEY = "idx-tree-config";

// 默认可配置的前缀列表
var DEFAULT_PREFIXES = [
    { prefix: "_", label: "_ (underscore)" },
    { prefix: ".", label: ". (dot)" },
    { prefix: "#", label: "# (hash)" },
    { prefix: "@", label: "@ (at)" },
    { prefix: "~", label: "~ (tilde)" }
];

class MyPlugin extends Plugin {
    constructor(...args) {
        super(...args);
        this.hideDocs = this.hideDocs.bind(this);
        this.observer = null;
    }

    onload() {
        // 初始化配置：默认只启用 _ 前缀
        this.data[STORAGE_KEY] = {
            enabledPrefixes: ["_"]  // 启用的前缀列表
        };
        var t = o.getFrontend();
        this.isMobile = (t === "mobile" || t === "browser-mobile");
        console.log(this.i18n.helloPlugin);
    }

    onLayoutReady() {
        this.hideDocs();
        this.observer = new MutationObserver(function () {
            this.hideDocs();
        }.bind(this));
        this.observer.observe(document, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }

    onunload() {
        if (this.observer) {
            this.observer.disconnect();
        }
        console.log(this.i18n.byePlugin);
    }

    uninstall() {
        var self = this;
        this.removeData(STORAGE_KEY).catch(function (e) {
            o.showMessage("uninstall [" + self.name + "] remove data [" + STORAGE_KEY + "] fail: " + e.msg);
        });
    }

    // 打开设置界面
    openSetting() {
        var self = this;
        var config = this.data[STORAGE_KEY] || { enabledPrefixes: ["_"] };
        var enabledPrefixes = config.enabledPrefixes || ["_"];

        // 构建设置界面 HTML
        var checkboxHtml = DEFAULT_PREFIXES.map(function(item) {
            var checked = enabledPrefixes.indexOf(item.prefix) !== -1 ? "checked" : "";
            return '<label class="fn__flex b3-label" style="padding: 8px 0;">' +
                '<input type="checkbox" class="prefix-checkbox" data-prefix="' + item.prefix + '" ' + checked + ' />' +
                '<span class="fn__space"></span>' +
                '<span>' + item.label + '</span>' +
                '</label>';
        }).join("");

        var html = '<div class="b3-dialog__content">' +
            '<div class="fn__flex-column">' +
            '<div class="b3-label" style="padding: 16px 0;">' +
            '<div class="fn__flex-center">' + this.i18n.prefixSettings + '</div>' +
            '<div class="fn__hr"></div>' +
            '<div class="fn__flex-column" style="gap: 4px;">' +
            checkboxHtml +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="b3-dialog__action">' +
            '<button class="b3-button b3-button--cancel" id="cancelBtn">' + this.i18n.cancel + '</button>' +
            '<div class="fn__space"></div>' +
            '<button class="b3-button b3-button--text" id="applyBtn">' + this.i18n.apply + '</button>' +
            '</div>';

        var dialog = new o.Dialog({
            title: this.i18n.settings,
            content: html,
            width: "520px"
        });

        var element = dialog.element;

        // 取消按钮
        element.querySelector("#cancelBtn").addEventListener("click", function() {
            dialog.destroy();
        });

        // 应用按钮
        element.querySelector("#applyBtn").addEventListener("click", function() {
            // 收集选中的前缀
            var checkboxes = element.querySelectorAll(".prefix-checkbox");
            var newEnabledPrefixes = [];
            checkboxes.forEach(function(cb) {
                if (cb.checked) {
                    newEnabledPrefixes.push(cb.getAttribute("data-prefix"));
                }
            });

            // 保存配置
            self.data[STORAGE_KEY] = {
                enabledPrefixes: newEnabledPrefixes
            };

            // 应用隐藏
            self.hideDocs();

            dialog.destroy();
            o.showMessage(self.i18n.settingsApplied);
        });
    }

    // 根据配置的前缀隐藏文档
    hideDocs() {
        try {
            var config = this.data[STORAGE_KEY] || { enabledPrefixes: ["_"] };
            var enabledPrefixes = config.enabledPrefixes || ["_"];

            // 如果没有启用任何前缀，显示所有文档
            var shouldHide = function(name) {
                if (!name || enabledPrefixes.length === 0) return false;
                for (var i = 0; i < enabledPrefixes.length; i++) {
                    if (name.charAt(0) === enabledPrefixes[i]) {
                        return true;
                    }
                }
                return false;
            };

            // 处理文档项
            var items = document.querySelectorAll(".file-tree .b3-list-item");
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var name = item.getAttribute ? item.getAttribute("data-name") : "";
                if (shouldHide(name)) {
                    item.style.display = "none";
                    var icon = item.querySelector ? item.querySelector(".b3-list-item__graphic") : null;
                    if (icon) {
                        icon.style.display = "none";
                    }
                } else {
                    // 显示之前被隐藏的文档
                    item.style.display = "";
                    var icon = item.querySelector ? item.querySelector(".b3-list-item__graphic") : null;
                    if (icon) {
                        icon.style.display = "";
                    }
                }
            }

            // 处理文件夹
            var folders = document.querySelectorAll(".file-tree .b3-list-item--folder");
            for (var j = 0; j < folders.length; j++) {
                var folder = folders[j];
                var folderName = folder.getAttribute ? folder.getAttribute("data-name") : "";
                if (shouldHide(folderName)) {
                    folder.style.display = "none";
                } else {
                    folder.style.display = "";
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = MyPlugin;
