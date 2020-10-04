// ==UserScript==
// @name        Dangke Tools
// @version     1.0
// @description Dangke Tools: 党课刷课工具
// @author      xxx (original author ShiZitou)
// @match       http*://dxzx.webvpn.ouc.edu.cn/*
// @match       http*://dxzx.vpn.ouc.edu.cn/*
// @match       http*://dxzx.ouc.edu.cn/*
// @grant       none
// @require     https://cdn.jsdelivr.net/npm/jquery@1/dist/jquery.min.js
// ==/UserScript==

'use strict';

let scriptName = 'Dangke Tools';
let scriptVersion = 'v0.4.8';
let messageRegion = undefined;

function message(msg) {
    console.log(msg);
    if (messageRegion != undefined) {
        messageRegion.innerText = msg;
    }
}

function randomInterval() {
    return Math.random() * 100 + 3000;
}

function lessonListAssist() {
    let region = document.createElement('span');
    document.getElementsByClassName('head_right')[0].children[0].children[0].appendChild(region);
    messageRegion = region;
    message('正在寻找未完成的课程...');
    let courseStatus = document.getElementsByClassName('fleft');
    let i = 0;
    for (i = 0; i < courseStatus.length; ++i) {
        message('正在检查第 ' + (i + 1) + ' 项课程 ' + document.getElementsByClassName('plan_a')[i].innerText + '...');
        if (courseStatus[i].children[2].innerText == '未完成') {
            break;
        }
    }
    if (i == courseStatus.length) {
        message('全部课程都已经完成');
    } else {
        let timeout = 60;
        let handle = setInterval(function() {
            message('即将跳转至第 ' + (i + 1) + ' 项课程 ' + document.getElementsByClassName('plan_a')[i].innerText + ' (' + timeout + 's)');
            if (timeout > 0) {
                --timeout;
            } else {
                clearInterval(handle);
                courseStatus[i].children[1].children[0].click();
            }
        }, 1000);
    }
}

function lessonVideoAssist() {
    let interval = randomInterval();
    let region = document.createElement('p');
    let n = 130; // 最大等待响应时长：n * 3s
    let i = 0, j = 0;
    let k = 0;
    if (document.getElementsByClassName('video_cont')[0] === undefined){
        message('视频出错，即将刷新');
        location.reload();
    } else {
        document.getElementsByClassName('video_cont')[0].appendChild(region);
        messageRegion = region;
    }
    message('开始工作')
    let handle = setInterval(function() {
        if (document.getElementsByClassName('video_head').length == 0) {
            message('视频出错，即将刷新');
            location.reload();
        } else {
            if (document.getElementsByClassName('video_red1')[0].children[0].style.color == 'red') {
                message('当前视频已经看完，将点击下一视频');
                if (document.getElementsByClassName('video_red1')[0].nextSibling.nextSibling === null) {
                    window.clearInterval(handle);
                    message('当前课程没有需要学习的内容了，将跳转回课程列表页面');
                    window.location.href = '/user/lesson';
                } else {
                    document.getElementsByClassName('video_red1')[0].nextSibling.nextSibling.children[0].click();
                }
            } else {
                let submitExists = document.getElementsByClassName('public_submit')[0] != undefined;
                let cancelExists = document.getElementsByClassName('public_cancel')[0] != undefined;
                // 开始观看：仅有 submit
                // 继续观看：有 submit 与 cancel，继续观看为 cancel
                // 中间要求继续：仅有 submit
                // 观看完成：仅有 submit
                if (submitExists && cancelExists) {
                    document.getElementsByClassName('public_cancel')[0].click();
                    document.getElementsByClassName('plyr--setup')[0].muted = true;
                    document.getElementsByClassName('plyr--setup')[0].play();
                    i = 0;
                    ++j;
                    message('第 ' + j + ' 次点击弹窗（继续学习；当前视频已被自动静音，如有需要请自行取消）');
                } else if (submitExists && !cancelExists) {
                    if (document.getElementsByClassName('public_text')[0].children[1].innerText == '视频已暂停，点击按钮后继续学习！') {
                        document.getElementsByClassName('public_submit')[0].click();
                        i = 0;
                        ++j;
                        message('第 ' + j + ' 次点击弹窗');
                    } else {
                        document.getElementsByClassName('public_submit')[0].click();
                        document.getElementsByClassName('plyr--setup')[0].muted = true;
                        document.getElementsByClassName('plyr--setup')[0].play();
                        i = 0;
                        ++j;
                        message('第 ' + j + ' 次点击弹窗（开始学习；当前视频已被自动静音，如有需要请自行取消）');
                    }
                } else if (!submitExists && !cancelExists) {
                    ++i;
                    message('共点击 ' + j + ' 次弹窗，预计下次弹窗 ' + (i / n * 100).toFixed(2) + '%；已过 ' + (i * interval / 60 / 1000).toFixed(2) + ' 分钟');
                    if (document.getElementsByClassName('plyr--stopped')[0] === undefined) {
                        k = 0;
                    } else {
                        ++k;
                        if (k > n / 10 - 5) {
                            message('视频暂停中，将在 ' + ((n / 10 - k) * interval / 60 / 1000).toFixed(2) + ' 分钟后刷新');
                        }
                        if (k >= n / 10) {
                            message('视频暂停中，可能已播完，即将刷新');
                            location.reload();
                        }
                    }
                }
            }
        }
    }, interval);
}

function theoreticalExamAssist() {
    document.onselectstart = null;
    document.oncontextmenu = null;
    message('已取消对选中文本与右键菜单的限制');
}

function init() {
    message(scriptName + ' ' + scriptVersion + ' 正在初始化...');
    let path = window.location.href.match(/^(https?:\/\/.*?)(\/.*)$/)[2];
    if (path == '/user/lesson') {
        message('当前位于课程列表页面');
        lessonListAssist();
    } else if (/\/.*?\/lesson\/play\?.*/.test(path)) {
        message('当前位于课程视频页面');
        lessonVideoAssist();
    } else if (/\/.*?\/exam_center\/exam\?.*/.test(path)) {
        message('当前位于理论测试页面');
        theoreticalExamAssist();
    } else {
        message('当前页面位于设置的站点中，但不是课程列表、视频或理论测试页面');
    }
}

init();
