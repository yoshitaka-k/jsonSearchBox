
/**
* 加工内容・得意先での検索フォームプラグイン
* inputフォームにdata-id="{String}"プロパティを設定してIDを別フォームへ代入
* <input data-id="test"> => <input id="test_id">
*
* @options json {JsonObject} ※必須！ リストに表示させるもの
*
* @options parentElement {Element} リストを表示する基準となるBOX
* @options listPosition {Dictionary} 表示の際の微調整用。x軸/y軸で指定
*/
;(function($, undefined) {
  "use strict";
  var uuid = new Date().getTime();

  /**
  * 各要素にプラグインをセット
  * @param {Dictionary} 設定情報
  */
  $.fn.jsonSearchBox = function(options){
    return this.each(function(){
      $.jsonSearchBox(this, options);
    });
  };

  /**
  * 実際の処理
  * @param {Element} プラグインを設定する要素
  * @param {Dictionary} 設定情報
  */
  $.jsonSearchBox = function(target, options) {
    var opts = $.extend({
      json: {},
      parentElement: $(target).parent(),
      listBoxParent: 'body',
      listBox: '.pop.json_search_box',
      listPosition: {
        x: 0,
        y: 0
      },
      searching: true,
    }, options);

    /**
    * 初期化・実行
    */
    var init = function() {
      // 認識用ID生成
      uuid += 1;
      $(target).attr('id', "jsb"+uuid);

      // 検索結果のリストボックスの生成
      createListBox(target);

      // フォーカス時のイベント設定
      $(target).focus(focusEvent);
      // 入力時のイベント設定
      $(target).keyup(keyupEvent);
      // フォーカスが外れた時のイベント設定
      $(target).blur(blurEvent);
    };

    /**
    * フォーカス時のイベント
    */
    var focusEvent = function() {
      var $self = $(this);
      $self.addClass('focus');
      showSearchResult($self.val());
    };

    /**
    * キーイベント
    */
    var keyupEvent = function(e) {
      var $self = $(this);
      var code = e.which;
      if (37 <= code && code <= 40) return false;
      showSearchResult($self.val());
    };

    /**
    * フォーカスが外れた時
    */
    var blurEvent = function() {
      var $self = $(this);
      $self.removeClass('focus');
      var promise = new Promise(function(resolve, reject){
        var length = $self.val().length;
        if (length == 0)
          $('#'+$self.data('id')+'_id').val('');
         else
          $('#'+$self.data('id')+'_id').val(blurResultSelected($self));
        resolve();
      }).then(function(){
        $('#'+$self.data('id')+'_id').keyup().change();
      });
    };

    /**
    * 検索結果のリストボックスを生成
    * @param {Element}
    */
    var createListBox = function(target) {
      // まだ作られていなかったら生成
      if ($('.pop.json_search_box').length === 0) {
        var $div = $('<div></div>')
          .addClass('pop json_search_box').html($('<ul></ul>'));
        if ($(target).data('id') != '')
          $div.attr('id', $(target).data('id')+'_list-wrap');
        $(opts.listBoxParent).append($div);
      }
    };

    /**
    * 検索イベント
    * @param {String} inputText 入力フォームの内容
    */
    var searchJson = function(inputText) {
      if (!inputText) return opts.json;
      var obj = {};
      $.each(opts.json, function(i, e){
        if (opts.searching) {
          if (e.indexOf(inputText) != -1)  obj[i] = e;
        } else {
          obj[i] = e;
        }
      });
      return obj;
    };
    /**
    * リスト選択
    */
    var listClickEvent = function() {
      $('.pop').hide('blind', 100);
      var dataHref = $(this).data('href');
      var dataId = $(this).data('id');
      $('#'+dataHref).val($(this).text());
      $('#'+dataId+'_id').val($(this).attr('id')).keyup().change();
      $(opts.listBox).hide('blind', 100);
      if ($('#'+dataHref).parent('label.labeled-input').length) {
        $('#'+dataHref).parent('label.labeled-input').addClass('active');
      }
      $('#'+dataHref).keyup().change();
      $(opts.listBox).hide('blind', 100);
      return false;
    }
    /**
    * リスト内に表示させるもの
    * @param {String} inputText 入力フォームの内容
    */
    var showSearchResult = function(inputText) {
      var html = '';
      var obj = searchJson(inputText);
      $.each(obj, function(i){
        html += '<li><a id="'+i+'" href="javascript:;" data-href="'+target.id+'" data-id="'+$(target).data('id')+'">'+obj[i]+'</a></li>'
      });
      $(opts.listBox+' ul').html(html);
      if ($(opts.listBox).css('display') == 'none') {
        $('.pop').css('display', 'none');
        var width = $(target).innerWidth();
        var height = $(target).outerHeight();
        var targetOffset = $(target).offset();
        var headerHeight = ($('#header').height() - 6);
        $(opts.listBox).css({
          'width': width,
          'top': height + targetOffset.top + opts.listPosition.y,
          'left': targetOffset.left + opts.listPosition.x,
        });
        $(opts.listBox).show('blind', 200);
      }
      // リスト選択
      $(opts.listBox+' a').click(listClickEvent);
    };
    /**
    * 入力フォームから離れた際にidフォームに値がなしだった場合
    * 入力フォームの内容と、検索結果の文字と一致するのがあった場合
    * idフォームに値を代入
    * @param {String} inputText 入力フォームの内容
    * @return {Int}
    */
    var blurResultSelected = function($input) {
      var id = '';
      $(opts.listBox).find('a').each(function(){
        if ($input.val() == $(this).text()) {
          id =  $(this).attr('id');
          return false;
        }
      });
      return id;
    };
    /**
    * クリックイベント
    */
    $(document).on('click', ':not(#'+target.id+', '+opts.listBox+')', function(){
      if (!$(target).hasClass('focus'))
        $(opts.listBox).hide('blind', 100);
    });

    // 初期化・実行
    init();
  };
})(jQuery);
