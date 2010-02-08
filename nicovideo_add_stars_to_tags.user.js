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
Array.prototype.replace = function(newVal) {
  this.splice.apply(this, [0, this.length].concat(newVal));
};

Array.prototype.partition = function(fun, thisp) {
  if (typeof fun != 'function')
    throw new TypeError();

  var res1 = [], res2 = [];
  for (var i = 0, len = this.length; i < len; i++) {
    if (i in this) {
      if (fun.call(thisp, this[i], i, this))
        res1.push(this[i]);
      else
        res2.push(this[i]);
    }
  }
  return [res1, res2];
};


// DOM要素を結合する。引数はScalaのmkString風
Array.prototype.joinDOM = function() {
  var [sep, head, tail] = [null, null, null],
      arg = Array.map(arguments, convertToDOM);

  switch(arg.length) {
  case 0: break;
  case 1: [sep] = arg; break;
  case 3: [head, sep, tail] = arg; break;
  default: throw new Error('invalid arguments');
  }

  var df = document.createDocumentFragment();
  function append(e, clone) {
    if (e !== null) df.appendChild(clone ? e.cloneNode(true) : e);
  }

  append(head);
  for (let [i, elem] in Iterator(this)) {
    if (i > 0) append(sep, true);
    append(convertToDOM(elem));
  }
  append(tail);

  return df;
};

// class関連関数
function setClassName(elem, className, flag) {
  if (flag) elem.classList.add(className);
  else elem.classList.remove(className);
}

// オブジェクトをDOMノードに変換する
function convertToDOM(elem) {
  if (elem === null)
    return null;
  if (elem instanceof String || typeof elem === 'string')
    return document.createTextNode(elem);
  if (elem instanceof XML)
    return e4xToDOM(elem);
  return elem;
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

Object.memoize = function(obj, defs) {
  function add(key, getter) {
    obj.__defineGetter__(key, function() {
                           delete this[key];
                           return this[key] = getter.call(this);
                         });
  }
  for (let key in defs) {
    if (defs.hasOwnProperty(key)) {
      add(key, defs[key]);
    }
  }
};

// Settings
const VideoID = unsafeWindow.Video.id;
const RequestURL = 'http://www.nicovideo.jp/tag_edit/' + VideoID;

const CategoryTags = [
  // エンタ・音楽・スポ
  "エンターテイメント 音楽 スポーツ",
  // 教養・生活
  "動物 ファッション 料理 日記 自然 科学 歴史 ラジオ ニコニコ動画講座",
  // 政治
  "政治",
  // やってみた
  "歌ってみた 演奏してみた 踊ってみた 描いてみた ニコニコ技術部",
  // アニメ・ゲーム
  "アニメ ゲーム",
  // 殿堂入りカテゴリ
  "アイドルマスター 東方 VOCALOID 例のアレ その他",
  "R-18"].join(' ').split(/\s+/);
// "投稿者コメント アンケート チャット テスト 台灣"

// prototype拡張された配列にする
const LockedTags = [].concat(unsafeWindow.Video.lockedTags);
const DomainTags = [].concat(unsafeWindow.Video.tags);
const ForeignTags = [];

// Resources
const CategoryIcon1 = 'http://res.nimg.jp/img/watch/ctg.png';
const CategoryIcon2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%15%00%00%00%09%08%06%00%00%00%DD%03gv%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00pIDAT(S%AD%92%01%0A%800%0C%03%DB%7D%D4%AF%E9K%AB%112b)n%E8%0Ac%20%E9%F5%A4%F3%B8%CA%FD%B0U%15%B1Y%FB%02D%23%8A%B7%0A%81%E7f%7B%F0%23B%3A%247%CD%0At%E8%2C%40s%18B%11%15j%B4%A4E6E%98%07%D9%FB%F7%06%3B%E8%D0jQ%3Ah%04%D2%FEWh5H%ADi%9Es%8FE%ADzV%ADz%16%7F%E0%E0%9D%3C%94%3B%E8%AC%40J9%00%00%00%00IEND%AEB%60%82';

const LockedCategoryIcon1 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%1B%00%00%00%09%08%06%00%00%00%C3%CAW%C5%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%C3IDAT8Oc%FC%0F%04g%19%19%19h%0D%8C%FF%FFg%60%A2%A6E%C6%9F%20N%86%D1%C8%1E%00%D9%C3x%86%81%E1%3F%B2%A0%D4%1A%06%86%F7!%0C%0C%DF%91%04A%9A%CF%F2!%04%D0%0DC%96%C3%17B%A8%96%9910h%EF%01Z%E6%C2%C0%F0%EC%14vW%E22%18%D9%01%2050%07%22%3B%94%09%E6%12%25%A0%EB%8D%81%16q%00%05%24%814H%91%20%90%0D3%1C%DDg%20y%18%06%99%01%92\'%E4C%B8e%F7%80%8A%9F%DF%85Z%0D%A4%AF%01%F9%EFq%84%09%B2%03%08Y%80l%04%DC2%06%60%10%0A%02-%01i%BE%07%A4%05%81%7CR%00%B2%2Fa%3EE%D7%8F%91%40H%B1%80T%B5L%A0%F4O%0F%00%B2%07%00GEB%E3%1B%C3%F1%7D%00%00%00%00IEND%AEB%60%82';

const LockedCategoryIcon2 = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%1B%00%00%00%09%08%06%00%00%00%C3%CAW%C5%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%09pHYs%00%00%0E%C3%00%00%0E%C3%01%C7o%A8d%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%D1IDAT8Oc%FC%0F%04%8C%8C%0B%19h%0D%FE%FF%8Fg%60%A2%A6E%FF%3F%25%80%DD%0C%A3%91%3D%00%B2%87%91%81a%C1%7F%84%E0%2B%86%09k.0%AC%0Aqc8%86%A4%12%A4%99%91o%01%5C%04%DD0d9%7C!%84j%99%D9.%86%DB%7BN1lu%A9a(8%05%D1F%AC%C1%C8%EA%40%96%C3%1C%88%E6P%90%CF%8A%FEo%FB%C4%F0%FF%3F%0Av%FC%9F%06%F6%F5%02%B08%3A%8D%AC%16%12%3A%B8%D5%C2%E4%98%20%EE%D7c%F0%E2%EBb%98x%17%1A%08w%A3%18%AC%F9%E2%19f%E1%08%13X%B0%81hb%83%10d%14%D42%20%CB%EC%02%83%F7%DD%22%B0%E6%F4%BB%A7%18%C2%CCHK%9F%A0%E0B%0FJt%13%D0%12%08i%16%90%AA%9A%09%94%FE%E9%01%40%F6%00%00%07C%84)%FAA%FCS%00%00%00%00IEND%AEB%60%82';

function className(name) '_GM_tag_' + name;

GM_addStyle(<><![CDATA[
  .__icon__ {
    vertical-align: middle;
    margin-right: 2px;
  }
  .__selected_and__ {
    outline: 2px solid red;
    -moz-outline-radius: 5px;
  }
  .__selected_minus__ {
    outline: 2px solid blue;
    -moz-outline-radius: 5px;
  }
  .__foreign_tag__ > a.nicopedia {
    background-color: #eee;
    color: blue;
  }
  .__selection_menu__ {
    position: absolute;
    -moz-box-sizing: border-box;
    top: -2.5em;
    left: 0;
    width: 100%;
    padding: 0.5em 10px;
    -moz-border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    line-height: 1.375;
  }
  .__selection_menu__ a {
    color: white;
  }
  .__selection_menu__ .__selected_and__,
  .__selection_menu__ .__selected_minus__ {
    margin: 0 3px;
  }
  .__commands__ {
    float: right;
  }
  .__commands__ .__command_link__ {
    color: #c00;
  }
  .__commands__ .__toggle_button__ {
    vertical-align: middle;
  }
  .__commands__ .__separator__ {
    color: #ccc;
  }
  .__description__ {
    font-size: 0.8em;
  }
  #video_tags {
    position: relative;
  }
]]></>.toString().replace(/__(.+?)__/g, function(_, name) className(name)));


// 各タグをタグ検索ページへのリンクと関連付けて管理するクラス
var TagLink = function(link) {
  this.link = link;
  this.name = link.textContent;
  this.hrefName = link.href.replace(
    new RegExp("^http://www\\.nicovideo\\.jp/tag/"), "");
  this.isLocked = LockedTags.include(this.name);
  this.isCategory = CategoryTags.include(this.name);
  this.isDomain = DomainTags.include(this.name);

  this.resetSelection();

  var self = this;
  link.addEventListener('mousedown', function(e) self._mousedown(e), false);
  link.addEventListener('click', function(e) self._click(e), false);
};

TagLink.ClassNames = {
  And: className('selected_and'),
  Minus: className('selected_minus'),
  Icon: className('icon'),
  Domain: className('domain_tag'),
  Foreign: className('foreign_tag')
};
TagLink.Marks = {};
Object.memoize(
  TagLink.Marks, {
    LockedCategory: function() {
      return e4xToDOM(<img src={LockedCategoryIcon2}
                           class={TagLink.ClassNames.Icon}
                           alt="★カテゴリ？" />);
    },
    Locked: function() {
      return e4xToDOM(<span style="color: #f90;">★</span>);
    },
    Category: function() {
      return e4xToDOM(<img src={CategoryIcon2}
                           class={TagLink.ClassNames.Icon}
                           alt="カテゴリ？" />);
    }
  });
TagLink.prototype = {
  _selectedAnd: false,
  get selectedAnd () { return this._selectedAnd; },
  set selectedAnd (selected) {
    this._selectedAnd = Boolean(selected);
    this._selectedMinus = false;
    this._updateClassName();
    return this._selectedAnd;
  },
  toggleAnd: function() {return this.selectedAnd = !this.selectedAnd; },
  _selectedMinus: false,
  get selectedMinus () { return this._selectedMinus; },
  set selectedMinus (selected) {
    this._selectedMinus = Boolean(selected);
    this._selectedAnd = false;
    this._updateClassName();
    return this._selectedMinus;
  },
  toggleMinus: function() {return this.selectedMinus = !this.selectedMinus; },
  resetSelection: function() { this.selectedAnd = this.selectedMinus = false; },
  _updateClassName: function() {
    setClassName(this.link, TagLink.ClassNames.And, this.selectedAnd);
    setClassName(this.link, TagLink.ClassNames.Minus, this.selectedMinus);
  },
  _mousedown: function(e) {
    // タグ複数選択時に，クリックと共に範囲選択されるのを防ぐ
    if (e.altKey && e.ctrlKey)
      e.preventDefault();
  },
  _click: function(e) {
    // 選択モード or Ctrl+Alt+クリック の場合，タグを選択・選択解除する
    if (AllTags.selectionMode || (e.altKey && e.ctrlKey)) {
      if (e.shiftKey) this.toggleMinus();
      else            this.toggleAnd();
      AllTags.selectionCallbacks.forEach(function(f) f());
      e.preventDefault();
      return;
    }
    // クリックされた場合，タグ検索へ移動
    // 一時的にhrefを書き換えることにより，タグの選択状況を反映させる
    var link = this.link, originalHref = link.href;
    link.href = AllTags.generateSearchURL(this);
    setTimeout(function() link.href = originalHref, 0);
  },
  decorate: function() {
    var parent = this.link.parentNode,
        icon = parent.querySelector('img[alt="カテゴリ"]');
    parent.classList.add(this.isDomain
                         ? TagLink.ClassNames.Domain
                         : TagLink.ClassNames.Foreign);
    if (icon !== null) {
      if (this.isLocked) {
        icon.src = LockedCategoryIcon1;
        icon.alt = '★カテゴリ';
      }
      return;
    }
    var name = (this.isLocked ? 'Locked' : '')+(this.isCategory ? 'Category' : '');
    if (name !== '')
      parent.insertBefore(TagLink.Marks[name].cloneNode(true), this.link);
  }
};



// 全てのタグ(海外タグ含む)を管理するクラス
var AllTags = [];
AllTags.selectionMode = false;
AllTags._showAll = false;
AllTags.__defineGetter__('showAll', function() this._showAll);
AllTags.__defineSetter__('showAll', function(value) {
                           value = Boolean(value);
                           GM_setValue('showAllTags', value);
                           return this._showAll = value;
                         });
AllTags.selectionCallbacks = [];
AllTags.container = null;
AllTags.init = function(container) {
  this.container = container;
  this._updateCache();
  this._updateTags();
};
AllTags.decorate = function() {
  this.forEach(function(link) link.decorate());
  CommandLinks.init(this.container);
  this.container.appendChild(SelectionMenu.menu);
};
AllTags.resetSelection = function() {
  this.forEach(function(link) link.resetSelection());
  this.selectionCallbacks.forEach(function(f) f());
};
AllTags.generateSearchURL = function(clickedTag) {
  var tags = this.filter(
    function(t) t.selectedAnd || (t === clickedTag && !t.selectedMinus)
  ).map(function(t) t.name).concat(
    this.filter(function(t) t.selectedMinus).map(function(t) '-' + t.name)
  );
  if (tags.length == 0)
    return 'javascript: void(0);';
  return 'http://www.nicovideo.jp/tag/' + tags.join('+');
};
AllTags._cacheObj = { all: null, domain: null };
AllTags.__defineGetter__('_cacheName', function() this.showAll ? 'all' : 'domain');
AllTags.__defineGetter__('_cache', function() this._cacheObj[this._cacheName]);
AllTags.__defineSetter__('_cache', function(v) this._cacheObj[this._cacheName] = v);
AllTags.clearCache = function() { this._cache = null; };
AllTags.clearAllCache = function() { this._cacheObj = { all: null, domain: null}; };
AllTags._updateCache = function() { this._cache = this.container.innerHTML; };
AllTags._showingForeignTags = false;
AllTags._updateTags = function() {
  var links = Array.slice(this.container.querySelectorAll('a[rel="tag"]') || []);
  var tags = links.map(function(l) l.textContent);
  if (!this.showAll) {
    DomainTags.replace(tags);
    this._showingForeignTags = false;
  } else {
    let ftags = tags.filter(function(t) !DomainTags.include(t));
    // 海外タグ表示→海外タグ表示と遷移した場合
    if (this._showingForeignTags) {
      let oldtags = this.map(function(t) t.name), newtags = [];
      // 海外タグと判定されたもののうち，新しく登場したものは国内タグと判定する
      [ftags, newtags] = ftags.partition(function(t) oldtags.include(t));
      DomainTags.push.apply(DomainTags, newtags);
    }
    this._showingForeignTags = true;
    ForeignTags.replace(ftags);
  }
  this.replace(links.map(function(link) new TagLink(link)));
};
AllTags.__defineSetter__(
  '_innerHTML', function(html) {
    this.container.innerHTML = html;
    this._updateCache();
    this._updateTags();
    // タグの更新後，大百科のアイコンが付かないニコニコ動画側のバグ(？)への対処
    this.forEach(this.container.querySelectorAll('[rel="tag"]:not(.nicopedia)'),
                 function(link) { link.classList.add('nicopedia'); });
    if (unsafeWindow.Nicopedia !== undefined)
      unsafeWindow.Nicopedia.decorateLinks();
    this.decorate();
  });
AllTags.refresh = function(callback) {
  var self = this;
  function update(html) {
    self._innerHTML = html;
    if (callback instanceof Function)
      callback();
  }

  if (this._cache !== null) {
    update(this._cache);
    return;
  }
  this.container.innerHTML = '<img src="img/watch/tool_loading.gif" alt="処理中">';
  GM_xmlhttpRequest(
    {method: 'POST', url: RequestURL,
     headers: {'X-Requested-With': 'XMLHttpRequest',
               'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
     data: 'cmd=tags' + (this.showAll ? '&all=1' : ''),
     onload: function(response) update(response.responseText)
    });
};


var HTMLUtil = {
  ClassNames: {
    CommandLink: className('command_link'),
    ToggleButton: className('toggle_button'),
    ToggleLabel: className('toggle_label')
  },
  setAttr: function(elem, attr) {
    for (let name in attr) {
      if (attr.hasOwnProperty(name))
        elem.setAttribute(name, attr[name]);
    }
  },
  _initElem: function(e4x, attr, className, type, fun) {
    var elem = e4xToDOM(e4x);
    this.setAttr(elem, attr);
    // クラス名を追加する (setAttr内でクラスが追加された場合上書きしないように)
    elem.classList.add(className);

    if (fun instanceof Function)
      elem.addEventListener(type, fun, false);
    return elem;
  },
  createCommandLink: function(text, fun, attr) {
    return this._initElem(
      <a href="javascript: void(0);">{text}</a>,
      attr, this.ClassNames.CommandLink,
      'click', fun);
  },
  createToggleButton: function(init, fun, attr) {
    var elem = this._initElem(
      <input type="checkbox"/>,
      attr, this.ClassNames.ToggleButton,
      'change', function() fun(this.checked)
    );
    elem.checked = init;
    return elem;
  },
  createLabeledToggle: function(label, init, fun) {
    var elem = e4xToDOM(<label class={this.ClassNames.ToggleLabel} />);
    elem.appendChild([this.createToggleButton(init, fun),
                      XML(label)].joinDOM());
    return elem;
  }
};

var SelectionMenu = {
  ClassNames: {
    Description: className('description'),
    Menu: className('selection_menu')
  },
  show: function() { this.menu.style.display = ''; },
  hide: function() { this.menu.style.display = 'none'; },
  setVisible: function(value) {
    if (value) SelectionMenu.show();
    else SelectionMenu.hide();
  }
};
Object.memoize(
  SelectionMenu, {
    search: function() {
      var link = HTMLUtil.createCommandLink('選択したタグで検索');
      AllTags.selectionCallbacks.push(
        function() link.href = AllTags.generateSearchURL());
      return link;
    },
    reset: function() {
      return HTMLUtil.createCommandLink(
        '選択解除', function() AllTags.resetSelection());
    },
    description: function() {
      return e4xToDOM(
        <span class={this.ClassNames.Description}>
        タグをクリックで <span class={TagLink.ClassNames.And}>選択</span>、
        Shift+クリックで <span class={TagLink.ClassNames.Minus}>マイナス選択</span>
        </span>);
    },
    menu: function() {
      var menu = e4xToDOM(
          <div class={this.ClassNames.Menu} style="display: none;"/>);
      menu.appendChild([this.search, this.reset, this.description].joinDOM(' | '));
      return menu;
    }
  }
);

var CommandLinks = {
  ClassNames: {
    Commands: className('commands'),
    Separator: className('separator')
  },
  _getEdit: function(container) {
    if (container === null) return null;
    var edit = container.querySelector('a[href^="javascript:startTagEdit"]');
    if (edit === null) return null;
    edit.textContent = "編集";
    edit.classList.add(HTMLUtil.ClassNames.CommandLink);
    edit.removeAttribute('style');
    return edit;
  },
  init: function(video_tags) {
    var tagsContainer = video_tags.firstElementChild,
        edit = this._getEdit(tagsContainer),
        commandsContainer, links;

    if (edit !== null) {
      commandsContainer = edit.parentNode;
      links = [edit, this.refresh, this.foreign, this.select];
    } else {
      // タグを更新できなかったとき。(混雑しています、など)
      if (tagsContainer === null)
        tagsContainer = video_tags;
      commandsContainer = document.createElement('nobr');
      tagsContainer.appendChild(commandsContainer);
      links = [this.refresh];
    }

    commandsContainer.classList.add(this.ClassNames.Commands);
    commandsContainer.appendChild(
      links.joinDOM('[ ',
                    <span class={this.ClassNames.Separator}> | </span>,
                    ' ]'));
  }
};
Object.memoize(
  CommandLinks, {
    refresh: function() {
      return HTMLUtil.createCommandLink(
        '更新', function() {
          AllTags.clearCache();
          AllTags.refresh();
        });
    },
    foreign: function() {
      return HTMLUtil.createLabeledToggle(
        '海外タグ', AllTags.showAll,
        function(value) {
          AllTags.showAll = value;
          AllTags.refresh();
        });
    },
    select: function() {
      return HTMLUtil.createLabeledToggle(
        '複数選択', AllTags.selectionMode,
        function(value) {
          AllTags.selectionMode = value;
          SelectionMenu.setVisible(value);
        });
    }
  }
);

unsafeWindow.finishTagEdit = function(url) {
  var editForm = document.getElementById('tag_edit_form');

  if(editForm !== null)
    editForm.innerHTML = '<img src="img/watch/tool_loading.gif" alt="処理中">';

  AllTags.clearAllCache();
  setTimeout(
    function() {
      AllTags.refresh(
        function() {
          document.getElementById('video_controls').style.display = '';
          if(editForm !== null)
            editForm.parentNode.removeChild(editForm);
        });
    }, 0);
};

// 初期化
(function() {
   AllTags.init(document.getElementById('video_tags'));
   AllTags.showAll = GM_getValue('showAllTags', AllTags.showAll);

   // 海外タグを表示しない場合
   if (!AllTags.showAll) {
     AllTags.decorate();
     return;
   }

   // タグがついていない動画の場合，大百科の要素追加を待たず即座に更新
   if (AllTags.length === 0) {
     AllTags.refresh();
     return;
   }

   // 大百科アイコン追加後に更新
   AllTags.container.addEventListener('DOMNodeInserted', inserted, false);
   // 10秒でタイムアウト
   setTimeout(refresh, 10000);

   // 大百科アイコン挿入後1回だけ更新する
   function refresh() {
     if (refresh.finished) return;
     refresh.finished = true;
     AllTags.container.removeEventListener('DOMNodeInserted', inserted, false);
     setTimeout(function() AllTags.refresh(), 0);
   }
   refresh.finished = false;

   // 追加された要素が大百科アイコンなら更新する
   function inserted(e) {
     var t = e.target;
     if (t.nodeName !== 'A' || t.title === undefined ||
         t.title.indexOf('大百科') !== 0)
       return;
     refresh();
   }
 })();

