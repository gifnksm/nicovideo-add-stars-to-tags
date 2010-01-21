// ==UserScript==
// @name           nicovideo Add Stars to Tags
// @namespace      http://d.hatena.ne.jp/gifnksm/
// @description    Add stars that represents their uploader set the tags unmodifiable.
// @include        http://www.nicovideo.jp/watch/*
// ==/UserScript==

/*
 * ユーティリティ関数群
 */
Array.prototype.include = function(x) this.indexOf(x) != -1;

// DOM要素を結合する。引数はScalaのmkString風
Array.prototype.joinDOM = function() {
  var sep, head, tail;
  switch (arguments.length) {
  case 0: [head, sep, tail] = [null, null, null]; break;
  case 1: [sep] = arguments; [head, tail] = [null, null]; break;
  case 3: [head, sep, tail] = arguments; break;
  default: throw new Error('invalid arguments');
  }

  var df = document.createDocumentFragment();
  function append(elem) {
    if (elem === null)
      return;
    if (elem instanceof String || typeof elem == 'string') {
      elem = document.createTextNode(elem);
    } else if (elem instanceof XML) {
      elem = e4xToDOM(elem);
    }
    df.appendChild(elem);
  }

  append(head);
  this.forEach( function(elem, i) { if (i > 0) { append(sep); } append(elem); });
  append(tail);
  return df;
};

// class関連関数
function hasClassName(elem, className) {
  return elem.className.split(/\s+/).indexOf(className) != -1;
}
function addClassName(elem, className) {
  if (!hasClassName(elem))
    elem.className += ' ' + className;
}
function removeClassName(elem, className) {
  elem.className = elem.className.split(/\s+/).filter(
    function(exist_name) exist_name != className).join(' ');
}
function setClassName(elem, className, flag) {
  if (flag) addClassName(elem, className);
  else removeClassName(elem, className);
}

// XML (E4X)からDOM Nodeへの変換
default xml namespace = "http://www.w3.org/1999/xhtml";
function e4xToDOM(xml, xmlns) {
  var pretty = XML.prettyPrinting;

  // 余分な空白を混入させないように，prettyPrintingを一時的に無効にする
  XML.prettyPrinting = false;
  var doc = (new DOMParser).parseFromString(
    '<root xmlns="' + xmlns + '">' + xml.toXMLString() + "</root>",
    "application/xml");
  XML.prettyPrinting = pretty;

  var imported = document.importNode(doc.documentElement, true);
  var range = document.createRange();
  range.selectNodeContents(imported);
  var fragment = range.extractContents();
  range.detach();
  return fragment.childNodes.length > 1 ? fragment : fragment.firstChild;
}


// Settings
const VideoID = unsafeWindow.Video.id;
const RequestURL = 'http://www.nicovideo.jp/tag_edit/' + VideoID;

const CategoryTags =
  "エンターテイメント 音楽 スポーツ\
  動物 ファッション 料理 日記 自然 科学 歴史 ラジオ ニコニコ動画講座\
  政治\
  歌ってみた 演奏してみた 踊ってみた 描いてみた ニコニコ技術部\
  アニメ ゲーム\
  アイドルマスター 東方 VOCALOID その他 R-18".split(/\s+/);
// "投稿者コメント アンケート チャット テスト 台灣"

const LockedTags = unsafeWindow.Video.lockedTags;


// Resources
const CategoryIcon1 = 'http://res.nimg.jp/img/watch/ctg.png';
const CategoryIcon2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%15%00%00%00%09%08%06%00%00%00%DD%03gv%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00pIDAT(S%AD%92%01%0A%800%0C%03%DB%7D%D4%AF%E9K%AB%112b)n%E8%0Ac%20%E9%F5%A4%F3%B8%CA%FD%B0U%15%B1Y%FB%02D%23%8A%B7%0A%81%E7f%7B%F0%23B%3A%247%CD%0At%E8%2C%40s%18B%11%15j%B4%A4E6E%98%07%D9%FB%F7%06%3B%E8%D0jQ%3Ah%04%D2%FEWh5H%ADi%9Es%8FE%ADzV%ADz%16%7F%E0%E0%9D%3C%94%3B%E8%AC%40J9%00%00%00%00IEND%AEB%60%82';

const LockedCategoryIcon1 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%1B%00%00%00%09%08%06%00%00%00%C3%CAW%C5%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%C3IDAT8Oc%FC%0F%04g%19%19%19h%0D%8C%FF%FFg%60%A2%A6E%C6%9F%20N%86%D1%C8%1E%00%D9%C3x%86%81%E1%3F%B2%A0%D4%1A%06%86%F7!%0C%0C%DF%91%04A%9A%CF%F2!%04%D0%0DC%96%C3%17B%A8%96%9910h%EF%01Z%E6%C2%C0%F0%EC%14vW%E22%18%D9%01%2050%07%22%3B%94%09%E6%12%25%A0%EB%8D%81%16q%00%05%24%814H%91%20%90%0D3%1C%DDg%20y%18%06%99%01%92\'%E4C%B8e%F7%80%8A%9F%DF%85Z%0D%A4%AF%01%F9%EFq%84%09%B2%03%08Y%80l%04%DC2%06%60%10%0A%02-%01i%BE%07%A4%05%81%7CR%00%B2%2Fa%3EE%D7%8F%91%40H%B1%80T%B5L%A0%F4O%0F%00%B2%07%00GEB%E3%1B%C3%F1%7D%00%00%00%00IEND%AEB%60%82';

const LockedCategoryIcon2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%1B%00%00%00%09%08%06%00%00%00%C3%CAW%C5%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%D1IDAT8Oc%FC%0F%04%8C%8C%0B%19h%0D%FE%FF%8Fg%60%A2%A6E%FF%3F%25%80%DD%0C%A3%91%3D%00%B2%87%91%81a%C1%7F%84%E0%2B%86%09k.0%AC%0Aqc8%86%A4%12%A4%99%91o%01%5C%04%DD0d9%7C!%84j%99%D9.%86%DB%7BN1lu%A9a(8%05%D1F%AC%C1%C8%EA%40%96%C3%1C%88%E6P%90%CF%8A%FEo%FB%C4%F0%FF%3F%0Av%FC%9F%06%F6%F5%02%B08%3A%8D%AC%16%12%3A%B8%D5%C2%E4%98%20%EE%D7c%F0%E2%EBb%98x%17%1A%08w%A3%18%AC%F9%E2%19f%E1%08%13X%B0%81hb%83%10d%14%D42%20%CB%EC%02%83%F7%DD%22%B0%E6%F4%BB%A7%18%C2%CCHK%9F%A0%E0B%0FJt%13%D0%12%08i%16%90%AA%9A%09%94%FE%E9%01%40%F6%00%00%07C%84)%FAA%FCS%00%00%00%00IEND%AEB%60%82';


const SelectedAndClassName = '_GM_tag_link_selected_and';
const SelectedMinusClassName = '_GM_tag_link_selected_minus';
const SelectionMenuClassName = '_GM_tag_selection_menu';
const DescClassName = '_GM_tag_desc';
GM_addStyle(<><![CDATA[
  ._GM_tag_link_selected_and {
    -moz-outline: 2px solid red;
    -moz-outline-radius: 5px;
  }
  ._GM_tag_link_selected_minus {
    -moz-outline: 2px solid blue;
    -moz-outline-radius: 5px;
  }
  ._GM_tag_selection_menu {
    position: absolute;
    -moz-box-sizing: border-box;
    top: -2.5em;
    left: 0;
    width: 100%;
    padding: 0.5em 10px;
    -moz-border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
  }
  ._GM_tag_selection_menu a {
    color: white;
  }
  ._GM_tag_selection_menu ._GM_tag_link_selected_and,
  ._GM_tag_selection_menu ._GM_tag_link_selected_minus {
    margin: 0 3px;
  }
  ._GM_tag_desc {
    font-size: 0.8em;
  }
  #video_tags {
    position: relative;
  }
]]></>);


// 各タグをタグ検索ページへのリンクと関連付けて管理するクラス
var TagLink = function(link) {
  this.link = link;
  this.name = link.textContent;
  this.hrefName = link.href.replace(
    new RegExp("^http://www\\.nicovideo\\.jp/tag/"), "");
  this.isLocked = LockedTags.include(this.name);
  this.isCategory = CategoryTags.include(this.name);

  this.resetSelection();
};

TagLink.prototype = {
  get selectedAnd () { return this._selectedAnd; },
  set selectedAnd (selected) {
    this._selectedAnd = Boolean(selected);
    this._selectedMinus = false;
    this._updateClassName();
    return this._selectedAnd;
  },
  get selectedMinus () { return this._selectedMinus; },
  set selectedMinus (selected) {
    this._selectedMinus = Boolean(selected);
    this._selectedAnd = false;
    this._updateClassName();
    return this._selectedMinus;
  },
  resetSelection: function() {
    this.selectedAnd = this.selectedMinus = false;
  },
  _updateClassName: function() {
    setClassName(this.link, SelectedAndClassName, this.selectedAnd);
    setClassName(this.link, SelectedMinusClassName, this.selectedMinus);
  },
  decorate: function() {
    var parent = this.link.parentNode,
        icon = parent.querySelector('img[alt="カテゴリ"]'),
        mark = null;

    if (this.isLocked && this.isCategory) {
      if (icon !== null) {
        icon.src = LockedCategoryIcon1;
        icon.alt = '★カテゴリ';
      } else {
        mark = e4xToDOM(<img src={LockedCategoryIcon2}
                             style="vertical-align: middle; margin-right: 2px;"
                             alt="★カテゴリ？" />);
      }
    } else if (this.isLocked) {
      mark = e4xToDOM(<span style="color: #f90;">★</span>);
    } else if (this.isCategory && icon === null) {
      mark = e4xToDOM(<img src={CategoryIcon2}
                           style="vertical-align: middle; margin-right: 2px;"
                           alt="カテゴリ？" />);
    }
    if (mark !== null)
      parent.insertBefore(mark, this.link);
  }
};



// 全てのタグ(海外タグ含む)を管理するクラス
var AllTags = [];
AllTags.selectionMode = false;
AllTags._showAll = GM_getValue('showAllTags', false);
AllTags.__defineGetter__('showAll', function() this._showAll);
AllTags.__defineSetter__('showAll', function(value) {
                           value = Boolean(value);
                           GM_setValue('showAllTags', value);
                           return this._showAll = value;
                         });
AllTags.showAll = GM_getValue('showAllTags', false);
AllTags.selectionCallbacks = [];
AllTags.updateLinks = function(links) {
  this.length = links.length;
  links.forEach(function(link, i) this[i] = new TagLink(link), this);
  this._setSelectionEvents(links);
  this.forEach(function(link) link.decorate());
};
AllTags.resetSelection = function() {
  this.forEach(function(link) link.resetSelection());
  this.selectionCallbacks.forEach(function(f) f());
};
AllTags.generateSearchAddr = function(clickedTag) {
  var and = this.filter(function(t) t.selectedAnd || t == clickedTag)
                .map(function(t) t.name),
    minus = this.filter(function(t) t.selectedMinus)
                .map(function(t) '-' + t.name);

  if (and.length == 0 && minus.length == 0)
    return 'javascript: void(0);';

  // マイナス検索は先頭にあると機能しないので末尾にまとめる
  return 'http://www.nicovideo.jp/tag/' + and.concat(minus).join('+');
},
AllTags._setSelectionEvents = function() {
  var callbacks = this.selectionCallbacks,
      self = this;
  this.forEach(
    function(tag) {
      tag.link.addEventListener('mousedown', function(e) mousedownFun(e), false);
      tag.link.addEventListener('click', function(e) clickFun(e, tag), false);
    });

  // タグ複数選択時に，クリックと共に範囲選択されるのを防ぐ
  function mousedownFun(e) { if (e.altKey && e.ctrlKey) e.preventDefault(); }

  function clickFun(e, tag) {
    // 選択モード or Ctrl+Alt+クリック の場合，タグを選択する
    if (self.selectionMode || (e.altKey && e.ctrlKey)) {
      // マイナス検索 or アンド検索
      if (e.shiftKey)
        tag.selectedMinus = !tag.selectedMinus;
      else
        tag.selectedAnd   = !tag.selectedAnd;

      callbacks.forEach(function(f) f());
      e.preventDefault();
      return;
    }

    // クリックされた場合，タグ検索へ移動
    // 一時的にhrefを書き換えることにより，タグの選択状況を反映させる
    var originalHref = tag.link.href;
    tag.link.href = self.generateSearchAddr(tag);
    setTimeout(function() tag.link.href = originalHref, 0);
  }
};
AllTags._cacheAllHTML = null;
AllTags._cacheDomainHTML = null;
AllTags.__defineGetter__(
  'innerHTMLCache',
  function() AllTags.showAll ? this._cacheAllHTML : this._cacheDomainHTML);
AllTags.__defineSetter__(
  'innerHTMLCache',
  function(value) AllTags.showAll
    ? this._cacheAllHTML = value
    : this._cacheDomainHTML = value);
AllTags.clearInnerHTMLCache = function() {
  this._cacheAllHTML = this._cacheDomainHTML = null;
};

function setAttr(elem, attr) {
  for (let name in attr) {
    if (attr.hasOwnProperty(name))
      elem.setAttribute(name, attr[name]);
  }
}

function createCommandLink(text, fun, attr) {
  var elem = e4xToDOM(<a href="javascript: void(0);">{text}</a>);
  setAttr(elem, attr);
  if (fun instanceof Function)
    elem.addEventListener('click', fun, false);
  return elem;
}

function createToggleButton(init, fun, attr) {
  var elem = e4xToDOM(<input type="checkbox"/>);
  setAttr(elem, attr);
  elem.checked = init;
  if (fun instanceof Function)
    elem.addEventListener('change', function() { fun(elem.checked); },
                          false);
  return elem;
}


function createSelectionMenu() {
  if (createSelectionMenu._menu !== undefined)
    return createSelectionMenu._menu;

  var search = createCommandLink('選択したタグで検索'),
      reset = createCommandLink('選択解除',
                                function()  AllTags.resetSelection()),
      desc = e4xToDOM(
        <span class={DescClassName}>
          タグをクリックで <span class={SelectedAndClassName}>選択</span>、
          Shift+クリックで <span class={SelectedMinusClassName}>マイナス選択</span>
        </span>),
      menu = e4xToDOM(
          <div class={SelectionMenuClassName} style="display: none;"/>);

  AllTags.selectionCallbacks.push(
    function() search.href = AllTags.generateSearchAddr());
  menu.appendChild([search, reset, desc].joinDOM(' | '));

  createSelectionMenu._menu = menu;
  return menu;
}

function decorateLinks() {
  var p = document.querySelector('#video_tags > p'),
      edit = p === null ? null
                        : p.querySelector('a[href^="javascript:startTagEdit"]'),
      refresh = createCommandLink('更新', function() {
                                    AllTags.innerHTMLCache = null;
                                    refreshTagLinks();
                                  },
                                  {style: 'color: #c00;'}),
      links, container;

  if(p !== null && edit !== null) {
    function genToggle(label, init, fun) {
      var elem = document.createElement('label');
      var toggle = createToggleButton(
        init, fun,
        { style: 'vertical-align: middle;' });
      elem.appendChild([toggle, XML(label)].joinDOM());
      return elem;
    }

    AllTags.updateLinks(Array.slice(p.querySelectorAll('a[rel="tag"]')));

    container = edit.parentNode;
    let menu = createSelectionMenu();
    container.parentNode.appendChild(menu);

    edit.textContent = "編集";
    links = [edit,
             refresh,
             genToggle('海外タグ', AllTags.showAll,
                       function(value) {
                         AllTags.showAll = value;
                         refreshTagLinks();
                       }),
             genToggle('複数選択', AllTags.selectionMode,
                       function(value) {
                         AllTags.selectionMode = value;
                         menu.style.display = value ? '' : 'none';
                       })];
  }
  else {
    // タグを更新できなかったとき。(混雑しています、など)
    if (p === null)
      p = document.getElementById('video_tags');
    container = document.createElement('nobr');
    p.appendChild(container);
    links = [refresh];
  }

  container.style.cssFloat = 'right';
  container.appendChild(
    links.joinDOM('[ ', <span style="color: #ccc;"> | </span>, ' ]'));
}



function refreshTagLinks(callback) {
  var video_tags = document.getElementById('video_tags');

  function updateInnerHTML(html) {
    AllTags.innerHTMLCache = html;
    video_tags.innerHTML = html;
    if (callback instanceof Function)
      callback();

    // タグの更新後，大百科のアイコンが付かないニコニコ動画側のバグ(？)への対処
    Array.forEach(
      video_tags.querySelectorAll('[rel="tag"]:not(.nicopedia)'),
      function(link) { console.log(link); link.className += ' nicopedia'; });

    if (unsafeWindow.Nicopedia !== undefined)
      unsafeWindow.Nicopedia.decorateLinks();
    decorateLinks();
  }


  if (AllTags.innerHTMLCache !== null) {
    updateInnerHTML(AllTags.innerHTMLCache);
    return;
  }
  video_tags.innerHTML = '<img src="img/watch/tool_loading.gif" alt="処理中">';

  GM_xmlhttpRequest(
    {
      method: 'POST',
      url: RequestURL,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      data: 'cmd=tags' + (AllTags.showAll ? '&all=1' : ''),
      onload: function(response) updateInnerHTML(response.responseText)
    });
}


unsafeWindow.finishTagEdit = function(url) {
  var editForm = document.getElementById('tag_edit_form');

  if(editForm !== null)
    editForm.innerHTML = '<img src="img/watch/tool_loading.gif" alt="処理中">';

  AllTags.clearInnerHTMLCache();
  setTimeout(function() {
               refreshTagLinks(
                 function() {
                   document.getElementById('video_controls').style.display = '';
                   if(editForm !== null)
                     editForm.parentNode.removeChild(editForm);
                 });
             }, 0);
};

(function() {
   var container = document.getElementById('video_tags');
   AllTags._cacheDomainHTML = container.innerHTML;
   if (AllTags.showAll) {
     let refreshFlag = false;
     function refresh() {
       if (refreshFlag)
         return;
       setTimeout(refreshTagLinks, 0);
       refreshFlag = true;
     }
     container.addEventListener(
       'DOMNodeInserted',
       function inserted(e) {
         var t = e.target;
         if (t.nodeName !== 'A' || t.title === undefined ||
             t.title.indexOf('大百科') !== 0)
           return;
         container.removeEventListener('DOMNodeInserted', inserted, false);
         refresh();
       }, false);
     // 20秒でタイムアウト
     setTimeout(refresh, 200000);
   } else {
     decorateLinks();
   }
 })();

