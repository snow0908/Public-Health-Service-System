# -*- coding: utf-8 -*-
import re

SRC = 'D:/AI_Project/Public-Health-Service-System/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/原型设计/高血压管理.html'
DST = 'D:/AI_Project/Public-Health-Service-System/Public-Health-Service-System/01-公共卫生服务系统产品文档/V1.0/02.需求设计/原型设计/妇女管理.html'

with open(SRC, 'r', encoding='utf-8') as f:
    content = f.read()

# ========== 1. 基础文本替换 ==========
content = content.replace('高血压管理 - 慢病管理', '妇女管理 - 妇幼管理')
content = content.replace('data-page="hypertension-management"', 'data-page="women-management"')
content = content.replace('/* ===== 高血压管理页面特有样式', '/* ===== 妇女管理页面特有样式')
content = content.replace('/* ===== 新建高血压专项档案弹框 =====', '/* ===== 新建妇女档案弹框 =====')
content = content.replace('/* ===== 档案选择弹框（新建专项第一步：选择居民档案） =====', '/* ===== 档案选择弹框（新建妇女档案第一步：选择居民档案） =====')

# ========== 2. tabbar & page-head ==========
content = content.replace('<title>高血压管理 - 慢病管理</title>', '<title>妇女管理 - 妇幼管理</title>')
content = content.replace('高血压管理</h1>', '妇女管理</h1>')
content = content.replace('>新建专项<', '>新建<')
content = content.replace('当前已在「高血压管理」页', '当前已在「妇女管理」页')
content = content.replace('>高血压管理</div>', '>妇女管理</div>')

# ========== 3. CSS 调整：去掉血压/分级样式，添加人群标签样式 ==========
# 替换 .grade-badge 区块为 .crowd-tags
old_css = '''  /* 当前分级（一级绿 / 二级橙 / 三级红） */
  .grade-badge{display:inline-flex;align-items:center;justify-content:center;height:20px;padding:0 10px;border-radius:4px;font-size:12px;line-height:1}
  .grade-badge.g1{background:var(--success-bg);color:var(--success);border:1px solid rgba(82,195,27,0.35)}
  .grade-badge.g2{background:var(--warning-bg);color:var(--warning);border:1px solid rgba(250,140,22,0.35)}
  .grade-badge.g3{background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border)}

  /* 血压值（收缩压/舒张压，按血压级别着色：3级红 / 2级橙 / 1级默认） */
  .bp-val{font-weight:var(--font-weight-medium)}
  .bp-val.lv3{color:var(--danger)}
  .bp-val.lv2{color:var(--warning)}
  .bp-val.lv1{color:var(--text-secondary)}'''

new_css = '''  /* 重点人群类型标签 */
  .crowd-tags{display:inline-flex;flex-wrap:wrap;gap:3px;align-items:center}
  .crowd-tag{display:inline-flex;align-items:center;justify-content:center;height:18px;padding:0 5px;border-radius:3px;font-size:11px;line-height:1;color:#fff}
  .crowd-tag.yun{background:#E53935}
  .crowd-tag.can{background:#FB8C00}
  .crowd-tag.di{background:#FDD835;color:#333}
  .crowd-tag.te{background:#43A047}
  .crowd-tag.jing{background:#1E88E5}
  .crowd-tag.jie{background:#8E24AA}
  .crowd-tag.lao{background:#757575}'''

content = content.replace(old_css, new_css)

# ========== 4. 筛选区替换 ==========
old_filter = '''      <!-- 筛选区 -->
      <div class="filter-panel">
        <div class="filter-row">
          <div class="filter-item"><label>管理机构</label>
            <select id="fOrg" class="fi-select w-lg">
              <option value="" selected>请选择</option>
              <option value="山东大学齐鲁医院">山东大学齐鲁医院</option>
              <option value="济南市历下区甸柳新村社区卫生服务中心">济南市历下区甸柳新村社区卫生服务中心</option>
              <option value="济南市市中区舜玉路社区卫生服务中心">济南市市中区舜玉路社区卫生服务中心</option>
              <option value="济南市历下区千佛山社区卫生服务中心">济南市历下区千佛山社区卫生服务中心</option>
              <option value="济南市天桥区工人新村社区卫生服务中心">济南市天桥区工人新村社区卫生服务中心</option>
              <option value="济南市历下区文化东路社区卫生服务中心">济南市历下区文化东路社区卫生服务中心</option>
            </select>
          </div>
          <div class="filter-item"><label>姓名</label><input id="fName" class="fi-ctl" placeholder="请输入姓名"></div>
          <div class="filter-item"><label>证件号</label><input id="fIdcard" class="fi-ctl" placeholder="请输入证件号"></div>
          <div class="filter-item"><label>管辖行政区</label>
            <select id="fRegion" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="解放路社区">解放路社区</option>
              <option value="千佛山社区">千佛山社区</option>
              <option value="燕山社区">燕山社区</option>
              <option value="姚家社区">姚家社区</option>
              <option value="舜玉社区">舜玉社区</option>
              <option value="甸柳社区">甸柳社区</option>
              <option value="文化东路社区">文化东路社区</option>
              <option value="工人新村社区">工人新村社区</option>
              <option value="窑头社区">窑头社区</option>
              <option value="七里山社区">七里山社区</option>
            </select>
          </div>
          <div class="filter-item"><label>锁定状态</label>
            <select id="fLock" class="fi-select">
              <option value="未上锁" selected>未上锁</option>
              <option value="">全部</option>
              <option value="已上锁">已上锁</option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item"><label>居民状态</label>
            <select id="fRStatus" class="fi-select">
              <option value="正常" selected>正常</option>
              <option value="">全部</option>
              <option value="死亡">死亡</option>
              <option value="迁出">迁出</option>
              <option value="注销">注销</option>
            </select>
          </div>
          <div class="filter-item"><label>管理状态</label>
            <select id="fMStatus" class="fi-select">
              <option value="有效管理" selected>有效管理</option>
              <option value="">全部</option>
              <option value="中断管理">中断管理</option>
              <option value="终止管理">终止管理</option>
            </select>
          </div>
          <div class="filter-item"><label>当前分级</label>
            <select id="fGrade" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="一级">一级</option>
              <option value="二级">二级</option>
              <option value="三级">三级</option>
            </select>
          </div>
          <div class="filter-item"><label>高血压类型</label>
            <select id="fHpType" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="原发性高血压">原发性高血压</option>
              <option value="继发性高血压">继发性高血压</option>
              <option value="不详">不详</option>
            </select>
          </div>
          <div class="filter-item"><label>管辖网格</label>
            <select id="fGrid" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="第一网格">第一网格</option>
              <option value="第二网格">第二网格</option>
              <option value="第三网格">第三网格</option>
              <option value="第四网格">第四网格</option>
            </select>
          </div>
          <div class="filter-btns">
            <button class="btn btn-default" onclick="resetFilter()">重置</button>
            <button class="btn btn-primary" onclick="applyFilter()">查询</button>
            <button class="btn-plain" id="btnExpand" onclick="toggleExtra()">展开 ▼</button>
          </div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>随访次数</label>
            <select id="fFuCntOp" class="fi-select fi-cmp">
              <option value="" selected>请选择</option>
              <option value="≥">≥</option>
              <option value="≤">≤</option>
              <option value="＝">＝</option>
            </select>
            <input id="fFuCnt" class="fi-ctl fi-num" placeholder="请输入">
          </div>
          <div class="filter-item"><label>体检次数</label>
            <select id="fExamCntOp" class="fi-select fi-cmp">
              <option value="" selected>请选择</option>
              <option value="≥">≥</option>
              <option value="≤">≤</option>
              <option value="＝">＝</option>
            </select>
            <input id="fExamCnt" class="fi-ctl fi-num" placeholder="请输入">
          </div>
          <div class="filter-item"><label>业务日期</label>
            <input id="fBizStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fBizEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
          <div class="filter-item"><label>随访类型</label>
            <select id="fFuType" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="一季度随访">一季度随访</option>
              <option value="二季度随访">二季度随访</option>
              <option value="三季度随访">三季度随访</option>
              <option value="四季度随访">四季度随访</option>
            </select>
          </div>
          <div class="filter-item"><label>血压项目</label>
            <input id="fBpItem" class="fi-ctl bp-trigger" placeholder="请选择" readonly onclick="openBpPanel()" title="点击配置体检项目筛选条件">
          </div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>档案完整度</label>
            <select id="fFullOp" class="fi-select fi-cmp">
              <option value="" selected>请选择</option>
              <option value="≥">≥</option>
              <option value="≤">≤</option>
              <option value="＝">＝</option>
            </select>
            <input id="fFullVal" class="fi-ctl fi-num" placeholder="请输入">
            <span class="fi-unit">%</span>
          </div>
          <div class="filter-item"><label>年度评估</label>
            <span class="fi-opts">
              <label class="fi-radio"><input type="radio" name="fYearEval" value="未评估">未评估</label>
              <label class="fi-radio"><input type="radio" name="fYearEval" value="无">无</label>
              <label class="fi-radio"><input type="radio" name="fYearEval" value="有">有</label>
            </span>
          </div>
          <div class="filter-item"><label>使用降压药</label>
            <span class="fi-opts">
              <label class="fi-radio"><input type="radio" name="fDrug" value="无">无</label>
              <label class="fi-radio"><input type="radio" name="fDrug" value="有">有</label>
            </span>
          </div>
          <div class="filter-item"><label>专项建档机构</label>
            <select id="fSpecOrg" class="fi-select w-lg">
              <option value="" selected>请选择</option>
              <option value="山东大学齐鲁医院">山东大学齐鲁医院</option>
              <option value="济南市历下区甸柳新村社区卫生服务中心">济南市历下区甸柳新村社区卫生服务中心</option>
              <option value="济南市市中区舜玉路社区卫生服务中心">济南市市中区舜玉路社区卫生服务中心</option>
              <option value="济南市历下区千佛山社区卫生服务中心">济南市历下区千佛山社区卫生服务中心</option>
              <option value="济南市天桥区工人新村社区卫生服务中心">济南市天桥区工人新村社区卫生服务中心</option>
              <option value="济南市历下区文化东路社区卫生服务中心">济南市历下区文化东路社区卫生服务中心</option>
            </select>
          </div>
          <div class="filter-item"><label>专项建档医生</label><input id="fSpecDoc" class="fi-ctl" placeholder="请输入"></div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>专项建档日期</label>
            <input id="fSpecStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fSpecEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
          <div class="filter-item"><label>居民建档日期</label>
            <input id="fArchStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fArchEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
          <div class="filter-item"><label>居民建档医生</label><input id="fArchDoc" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>居民类型</label>
            <select id="fResidentType" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="常住">常住</option>
              <option value="流动">流动</option>
            </select>
          </div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>出生日期</label>
            <input id="fBirthStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fBirthEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
          <div class="filter-item"><label>性别</label>
            <select id="fGender" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="filter-item"><label>电话号码</label><input id="fPhone" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>居住类型</label>
            <select id="fLiveType" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="常住">常住</option>
              <option value="暂住">暂住</option>
              <option value="人户分离">人户分离</option>
            </select>
          </div>
          <div class="filter-item"><label>档案编号</label><input id="fArchNo" class="fi-ctl" placeholder="请输入档案编号"></div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>详细地址</label><input id="fAddress" class="fi-ctl" placeholder="请输入详细地址"></div>
          <div class="filter-item">
            <label class="fi-check"><input type="checkbox" id="fMine">只看个人管理档案</label>
          </div>
        </div>
      </div>'''

new_filter = '''      <!-- 筛选区 -->
      <div class="filter-panel">
        <div class="filter-row">
          <div class="filter-item"><label>管理机构</label>
            <select id="fOrg" class="fi-select w-lg">
              <option value="" selected>请选择</option>
              <option value="山东大学齐鲁医院">山东大学齐鲁医院</option>
              <option value="扬州市江都区滨江人民医院">扬州市江都区滨江人民医院</option>
              <option value="济南市历下区甸柳新村社区卫生服务中心">济南市历下区甸柳新村社区卫生服务中心</option>
              <option value="济南市市中区舜玉路社区卫生服务中心">济南市市中区舜玉路社区卫生服务中心</option>
              <option value="济南市历下区千佛山社区卫生服务中心">济南市历下区千佛山社区卫生服务中心</option>
              <option value="济南市天桥区工人新村社区卫生服务中心">济南市天桥区工人新村社区卫生服务中心</option>
              <option value="济南市历下区文化东路社区卫生服务中心">济南市历下区文化东路社区卫生服务中心</option>
            </select>
          </div>
          <div class="filter-item"><label>姓名</label><input id="fName" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>证件号</label><input id="fIdcard" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>婚姻状况</label>
            <select id="fMarriage" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="未婚">未婚</option>
              <option value="已婚">已婚</option>
              <option value="离异">离异</option>
              <option value="丧偶">丧偶</option>
              <option value="不详">不详</option>
            </select>
          </div>
          <div class="filter-item"><label>建档日期</label>
            <input id="fCreateStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fCreateEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item"><label>档案编号</label><input id="fArchNo" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>电话号码</label><input id="fPhone" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>个人档案情况</label>
            <select id="fArchStatus" class="fi-select">
              <option value="" selected>全部</option>
              <option value="正常">正常</option>
              <option value="死亡">死亡</option>
              <option value="迁出">迁出</option>
              <option value="注销">注销</option>
            </select>
          </div>
          <div class="filter-item"><label>管辖行政区</label>
            <select id="fRegion" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="解放路社区">解放路社区</option>
              <option value="千佛山社区">千佛山社区</option>
              <option value="燕山社区">燕山社区</option>
              <option value="姚家社区">姚家社区</option>
              <option value="舜玉社区">舜玉社区</option>
              <option value="甸柳社区">甸柳社区</option>
              <option value="文化东路社区">文化东路社区</option>
              <option value="工人新村社区">工人新村社区</option>
              <option value="窑头社区">窑头社区</option>
              <option value="七里山社区">七里山社区</option>
            </select>
          </div>
          <div class="filter-item"><label>重点人群类型</label>
            <select id="fCrowd" class="fi-select">
              <option value="" selected>请选择</option>
              <option value="孕产妇">孕产妇</option>
              <option value="残疾人">残疾人</option>
              <option value="低保户">低保户</option>
              <option value="特困人员">特困人员</option>
              <option value="精神病患者">精神病患者</option>
              <option value="结核病患者">结核病患者</option>
              <option value="老年人">老年人</option>
            </select>
          </div>
          <div class="filter-btns">
            <button class="btn btn-default" onclick="resetFilter()">重置</button>
            <button class="btn btn-primary" onclick="applyFilter()">查询</button>
            <button class="btn-plain" id="btnExpand" onclick="toggleExtra()">展开 ▼</button>
          </div>
        </div>
        <div class="filter-row extra">
          <div class="filter-item"><label>出生日期</label>
            <input id="fBirthStart" class="fi-ctl fi-date" type="text" placeholder="开始日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
            <span class="fi-sep">—</span>
            <input id="fBirthEnd" class="fi-ctl fi-date" type="text" placeholder="结束日期" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value){this.type='text'}">
          </div>
          <div class="filter-item"><label>责任医生</label><input id="fDutyDoc" class="fi-ctl" placeholder="请输入"></div>
          <div class="filter-item"><label>锁定状态</label>
            <select id="fLock" class="fi-select">
              <option value="" selected>全部</option>
              <option value="未上锁">未上锁</option>
              <option value="已上锁">已上锁</option>
            </select>
          </div>
          <div class="filter-item"><label>详细地址</label><input id="fAddress" class="fi-ctl" placeholder="请输入"></div>
        </div>
      </div>'''

content = content.replace(old_filter, new_filter)

# ========== 5. 表格列替换 ==========
old_table_cols = '''          <colgroup>
            <col style="width:44px"><col style="width:150px"><col style="width:76px"><col style="width:148px"><col style="width:82px"><col style="width:70px"><col style="width:92px"><col style="width:104px"><col style="width:44px"><col style="width:44px"><col style="width:110px"><col style="width:96px"><col style="width:160px"><col style="width:130px"><col style="width:104px"><col style="width:100px"><col style="width:92px"><col style="width:140px"><col style="width:76px"><col style="width:76px"><col style="width:76px"><col style="width:130px">
          </colgroup>
          <thead>
            <tr>
              <th class="center">序号</th>
              <th>管理机构</th>
              <th>姓名</th>
              <th>证件号</th>
              <th>证件类型</th>
              <th class="center">当前分级</th>
              <th class="center">血压</th>
              <th>高血压类型</th>
              <th class="center">性别</th>
              <th class="center">年龄</th>
              <th>电话号码</th>
              <th>出生日期</th>
              <th>详细地址</th>
              <th>档案编号</th>
              <th>管辖行政区</th>
              <th>专项建档时间</th>
              <th>专项建档医生</th>
              <th class="center">专项档案完整度(%)</th>
              <th>居民状态</th>
              <th>管理状态</th>
              <th>锁定状态</th>
              <th class="center">操作</th>
            </tr>
          </thead>'''

new_table_cols = '''          <colgroup>
            <col style="width:44px"><col style="width:150px"><col style="width:76px"><col style="width:148px"><col style="width:82px"><col style="width:44px"><col style="width:44px"><col style="width:96px"><col style="width:76px"><col style="width:120px"><col style="width:104px"><col style="width:100px"><col style="width:130px"><col style="width:104px"><col style="width:96px"><col style="width:100px"><col style="width:76px"><col style="width:130px">
          </colgroup>
          <thead>
            <tr>
              <th class="center">序号</th>
              <th>管理机构</th>
              <th>姓名</th>
              <th>证件号</th>
              <th>证件类型</th>
              <th class="center">性别</th>
              <th class="center">年龄</th>
              <th>出生日期</th>
              <th>婚姻状况</th>
              <th>重点人群类型</th>
              <th>联系电话</th>
              <th>详细地址</th>
              <th>档案编号</th>
              <th>管辖行政区</th>
              <th>建档日期</th>
              <th>责任医生</th>
              <th>锁定状态</th>
              <th class="center">操作</th>
            </tr>
          </thead>'''

content = content.replace(old_table_cols, new_table_cols)

# 同步修改 min-width
content = content.replace('min-width:2144px', 'min-width:1820px')
# 同步修改空态 colspan
content = content.replace("colspan=\"22\"", "colspan=\"18\"")

# ========== 6. 模拟数据替换 ==========
old_data = '''  var hypertensionData = [
    { org:'山东大学齐鲁医院', name:'王秀英', idcard:'370102195403152847', idType:'居民身份证', grade:'二级', sbp:168, dbp:102, hpType:'原发性高血压', gender:'女', age:72, phone:'13905312361', birth:'1954-03-15', address:'济南市历下区解放路105号',        archNo:'370102JM26001', region:'解放路社区',   grid:'第一网格', specDate:'2024-03-11', specDoc:'徐东升', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'刘德海', idcard:'37010219551130863X', idType:'居民身份证', grade:'三级', sbp:186, dbp:112, hpType:'原发性高血压', gender:'男', age:70, phone:'13605401937', birth:'1955-11-30', address:'济南市历下区和平路36号',          archNo:'370102JM26004', region:'解放路社区',   grid:'第一网格', specDate:'2024-03-26', specDoc:'徐东升', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'杨春梅', idcard:'370102198109082543', idType:'居民身份证', grade:'一级', sbp:148, dbp:94,  hpType:'原发性高血压', gender:'女', age:45, phone:'18764165283', birth:'1981-09-08', address:'济南市历下区山大南路27号',        archNo:'370102JM26006', region:'千佛山社区',   grid:'第二网格', specDate:'2024-04-15', specDoc:'李蕾',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'周振华', idcard:'370102194910056317', idType:'居民身份证', grade:'二级', sbp:172, dbp:105, hpType:'原发性高血压', gender:'男', age:76, phone:'13583176094', birth:'1949-10-05', address:'济南市历下区燕山小区东路18号',    archNo:'370102JM26009', region:'燕山社区',     grid:'第三网格', specDate:'2024-04-27', specDoc:'李蕾',   full:85,  rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'冯立军', idcard:'370102197706285516', idType:'居民身份证', grade:'二级', sbp:164, dbp:101, hpType:'继发性高血压', gender:'男', age:49, phone:'13791046538', birth:'1977-06-28', address:'济南市历城区华信路3号',          archNo:'370102JM26016', region:'姚家社区',     grid:'第二网格', specDate:'2024-05-09', specDoc:'朱劲松', full:60,  rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'高凤仙', idcard:'370102194503124826', idType:'居民身份证', grade:'三级', sbp:192, dbp:118, hpType:'原发性高血压', gender:'女', age:81, phone:'13626415789', birth:'1945-03-12', address:'济南市市中区二环南路2766号',    archNo:'370102JM26017', region:'舜玉社区',     grid:'第一网格', specDate:'2024-05-21', specDoc:'敖鹏天', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'韩淑芬', idcard:'370102195912034420', idType:'居民身份证', grade:'二级', sbp:174, dbp:106, hpType:'原发性高血压', gender:'女', age:66, phone:'13370583146', birth:'1959-12-03', address:'济南市历下区燕山小区南路8号',    archNo:'370102JM26021', region:'燕山社区',     grid:'第三网格', specDate:'2024-06-03', specDoc:'陆柳琳', full:100, rStatus:'正常', mStatus:'中断管理', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'谭德顺', idcard:'370102195008195517', idType:'居民身份证', grade:'三级', sbp:188, dbp:114, hpType:'原发性高血压', gender:'男', age:76, phone:'15588860279', birth:'1950-08-19', address:'济南市市中区舜玉路112号',          archNo:'370102JM26022', region:'舜玉社区',     grid:'第一网格', specDate:'2024-06-16', specDoc:'敖鹏天', full:100, rStatus:'死亡', mStatus:'终止管理', lock:'已上锁' },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'董梅香', idcard:'370102196705244824', idType:'居民身份证', grade:'一级', sbp:154, dbp:96,  hpType:'原发性高血压', gender:'女', age:59, phone:'15863770125', birth:'1967-05-24', address:'济南市历下区甸柳新村七区3号楼',    archNo:'370102JM26023', region:'甸柳社区',     grid:'第二网格', specDate:'2024-06-30', specDoc:'王盛',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'贾世昌', idcard:'370102195310076311', idType:'居民身份证', grade:'二级', sbp:176, dbp:108, hpType:'原发性高血压', gender:'男', age:72, phone:'13006597582', birth:'1953-10-07', address:'济南市历下区姚家路29号',            archNo:'370102JM26024', region:'姚家社区',     grid:'第二网格', specDate:'2024-07-11', specDoc:'徐东升', full:0,   rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'潘金凤', idcard:'370102196202144226', idType:'居民身份证', grade:'一级', sbp:148, dbp:92,  hpType:'原发性高血压', gender:'女', age:64, phone:'15098763214', birth:'1962-02-14', address:'济南市天桥区堤口路92号',            archNo:'370105JM26025', region:'工人新村社区', grid:'第一网格', specDate:'2024-07-25', specDoc:'朱劲松', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市历下区千佛山社区卫生服务中心', name:'何广田', idcard:'370102196511023513', idType:'居民身份证', grade:'二级', sbp:160, dbp:102, hpType:'不详',         gender:'男', age:60, phone:'15508660215', birth:'1965-11-02', address:'济南市历下区经十路9777号',         archNo:'370102JM26026', region:'千佛山社区',   grid:'第二网格', specDate:'2024-08-06', specDoc:'王盛',   full:40,  rStatus:'迁出', mStatus:'终止管理', lock:'已上锁' },
    { org:'济南市历下区文化东路社区卫生服务中心', name:'邵玉洁', idcard:'370102197006084824', idType:'居民身份证', grade:'一级', sbp:146, dbp:90,  hpType:'原发性高血压', gender:'女', age:56, phone:'15562593049', birth:'1970-06-08', address:'济南市历下区文化东路51号',        archNo:'370102JM26027', region:'文化东路社区', grid:'第四网格', specDate:'2024-08-19', specDoc:'李蕾',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'崔洪斌', idcard:'370102195609253719', idType:'居民身份证', grade:'三级', sbp:190, dbp:116, hpType:'继发性高血压', gender:'男', age:69, phone:'15589963027', birth:'1956-09-25', address:'济南市历下区窑头路7号',             archNo:'370102JM26028', region:'窑头社区',     grid:'第三网格', specDate:'2024-08-28', specDoc:'徐东升', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'白淑珍', idcard:'370102194804304428', idType:'居民身份证', grade:'二级', sbp:168, dbp:104, hpType:'原发性高血压', gender:'女', age:78, phone:'13064019573', birth:'1948-04-30', address:'济南市市中区六里山南路20号',      archNo:'370103JM26029', region:'舜玉社区',     grid:'第一网格', specDate:'2024-09-10', specDoc:'敖鹏天', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'孙福禄', idcard:'370103195201275511', idType:'居民身份证', grade:'一级', sbp:150, dbp:88,  hpType:'原发性高血压', gender:'男', age:74, phone:'15550062317', birth:'1952-01-27', address:'济南市市中区七里山路15号',        archNo:'370103JM26030', region:'七里山社区',   grid:'第一网格', specDate:'2024-09-24', specDoc:'敖鹏天', full:95,  rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'罗建萍', idcard:'370102196303184426', idType:'居民身份证', grade:'二级', sbp:166, dbp:98,  hpType:'原发性高血压', gender:'女', age:63, phone:'15806604013', birth:'1963-03-18', address:'济南市历下区甸柳新村二区4号楼',    archNo:'370102JM26031', region:'甸柳社区',     grid:'第二网格', specDate:'2024-10-08', specDoc:'陆柳琳', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市历下区千佛山社区卫生服务中心', name:'蒋春林', idcard:'370102195707065518', idType:'居民身份证', grade:'一级', sbp:144, dbp:92,  hpType:'原发性高血压', gender:'男', age:69, phone:'13793167482', birth:'1957-07-06', address:'济南市历下区科院路19号',           archNo:'370102JM26032', region:'千佛山社区',   grid:'第二网格', specDate:'2024-10-21', specDoc:'朱劲松', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市历下区文化东路社区卫生服务中心', name:'万秀琴', idcard:'370103195505214824', idType:'居民身份证', grade:'二级', sbp:158, dbp:102, hpType:'原发性高血压', gender:'女', age:71, phone:'15165374029', birth:'1955-05-21', address:'济南市历下区文化东路88号',        archNo:'370102JM26033', region:'文化东路社区', grid:'第四网格', specDate:'2024-11-02', specDoc:'李蕾',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'顾长顺', idcard:'370102194912113317', idType:'居民身份证', grade:'二级', sbp:170, dbp:100, hpType:'原发性高血压', gender:'男', age:76, phone:'13064029581', birth:'1949-12-11', address:'济南市历下区和平路53号',          archNo:'370102JM26034', region:'解放路社区',   grid:'第一网格', specDate:'2024-11-15', specDoc:'徐东升', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'尹桂芳', idcard:'370102196610154826', idType:'居民身份证', grade:'一级', sbp:142, dbp:90,  hpType:'原发性高血压', gender:'女', age:59, phone:'15066651730', birth:'1966-10-15', address:'济南市天桥区工人新村北街7号',      archNo:'370105JM26035', region:'工人新村社区', grid:'第一网格', specDate:'2024-11-28', specDoc:'王盛',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'严守成', idcard:'370102196004083311', idType:'居民身份证', grade:'二级', sbp:176, dbp:104, hpType:'原发性高血压', gender:'男', age:66, phone:'15806609742', birth:'1960-04-08', address:'济南市历下区姚家路118号',           archNo:'370102JM26036', region:'姚家社区',     grid:'第二网格', specDate:'2024-12-10', specDoc:'王盛',   full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'华凤英', idcard:'370102195808304420', idType:'居民身份证', grade:'一级', sbp:152, dbp:94,  hpType:'原发性高血压', gender:'女', age:68, phone:'15562588107', birth:'1958-08-30', address:'济南市市中区玉函路39号',           archNo:'370103JM26037', region:'舜玉社区',     grid:'第一网格', specDate:'2024-12-23', specDoc:'敖鹏天', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'尤德胜', idcard:'370102197202195513', idType:'居民身份证', grade:'二级', sbp:162, dbp:100, hpType:'原发性高血压', gender:'男', age:54, phone:'13176645908', birth:'1972-02-19', address:'济南市历下区甸柳新村八区2号楼',    archNo:'370102JM26038', region:'甸柳社区',     grid:'第二网格', specDate:'2025-01-06', specDoc:'陆柳琳', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'汤玉珍', idcard:'370103195111234426', idType:'居民身份证', grade:'二级', sbp:172, dbp:106, hpType:'原发性高血压', gender:'女', age:74, phone:'15589917860', birth:'1951-11-23', address:'济南市天桥区济泺路130号',           archNo:'370105JM26039', region:'工人新村社区', grid:'第一网格', specDate:'2025-01-19', specDoc:'朱劲松', full:100, rStatus:'正常', mStatus:'有效管理', lock:'未上锁' }
  ];'''

new_data = '''  var womenData = [
    { org:'山东大学齐鲁医院', name:'李大海', idcard:'110101198005010149', idType:'居民身份证', gender:'女', age:46, phone:'13652478565', birth:'1980-05-01', marriage:'已婚', crowd:'', address:'一组2号', archNo:'32101211811812486', region:'善玉村', createDate:'2026-09-03', dutyDoc:'朱劲松', lock:'未上锁' },
    { org:'扬州市江都区滨江人民医院', name:'小山东高速', idcard:'510123199001010106', idType:'居民身份证', gender:'女', age:36, phone:'13899229292', birth:'1990-01-01', marriage:'', crowd:'孕,残,低,特,精,结', address:'1212', archNo:'51011500100100076', region:'北街社区', createDate:'2023-04-03', dutyDoc:'朱劲松', lock:'未上锁' },
    { org:'扬州市江都区滨江人民医院', name:'夏余兰', idcard:'321088195803137723', idType:'居民身份证', gender:'女', age:68, phone:'15715251671', birth:'1958-03-13', marriage:'', crowd:'老', address:'朱家组', archNo:'3210121121200035', region:'韩阳村', createDate:'2022-09-01', dutyDoc:'朱劲松', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'王秀英', idcard:'370102195403152847', idType:'居民身份证', gender:'女', age:72, phone:'13905312361', birth:'1954-03-15', marriage:'已婚', crowd:'老', address:'济南市历下区解放路105号', archNo:'370102JM26001', region:'解放路社区', createDate:'2024-03-11', dutyDoc:'徐东升', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'杨春梅', idcard:'370102198109082543', idType:'居民身份证', gender:'女', age:45, phone:'18764165283', birth:'1981-09-08', marriage:'已婚', crowd:'孕', address:'济南市历下区山大南路27号', archNo:'370102JM26006', region:'千佛山社区', createDate:'2024-04-15', dutyDoc:'李蕾', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'高凤仙', idcard:'370102194503124826', idType:'居民身份证', gender:'女', age:81, phone:'13626415789', birth:'1945-03-12', marriage:'丧偶', crowd:'老', address:'济南市市中区二环南路2766号', archNo:'370102JM26017', region:'舜玉社区', createDate:'2024-05-21', dutyDoc:'敖鹏天', lock:'未上锁' },
    { org:'山东大学齐鲁医院', name:'韩淑芬', idcard:'370102195912034420', idType:'居民身份证', gender:'女', age:66, phone:'13370583146', birth:'1959-12-03', marriage:'离异', crowd:'老,残', address:'济南市历下区燕山小区南路8号', archNo:'370102JM26021', region:'燕山社区', createDate:'2024-06-03', dutyDoc:'陆柳琳', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'白淑珍', idcard:'370102194804304428', idType:'居民身份证', gender:'女', age:78, phone:'13064019573', birth:'1948-04-30', marriage:'已婚', crowd:'老', address:'济南市市中区六里山南路20号', archNo:'370103JM26029', region:'舜玉社区', createDate:'2024-09-10', dutyDoc:'敖鹏天', lock:'未上锁' },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'董梅香', idcard:'370102196705244824', idType:'居民身份证', gender:'女', age:59, phone:'15863770125', birth:'1967-05-24', marriage:'已婚', crowd:'', address:'济南市历下区甸柳新村七区3号楼', archNo:'370102JM26023', region:'甸柳社区', createDate:'2024-06-30', dutyDoc:'王盛', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'潘金凤', idcard:'370102196202144226', idType:'居民身份证', gender:'女', age:64, phone:'15098763214', birth:'1962-02-14', marriage:'已婚', crowd:'低', address:'济南市天桥区堤口路92号', archNo:'370105JM26025', region:'工人新村社区', createDate:'2024-07-25', dutyDoc:'朱劲松', lock:'未上锁' },
    { org:'济南市历下区文化东路社区卫生服务中心', name:'邵玉洁', idcard:'370102197006084824', idType:'居民身份证', gender:'女', age:56, phone:'15562593049', birth:'1970-06-08', marriage:'未婚', crowd:'', address:'济南市历下区文化东路51号', archNo:'370102JM26027', region:'文化东路社区', createDate:'2024-08-19', dutyDoc:'李蕾', lock:'未上锁' },
    { org:'济南市历下区甸柳新村社区卫生服务中心', name:'罗建萍', idcard:'370102196303184426', idType:'居民身份证', gender:'女', age:63, phone:'15806604013', birth:'1963-03-18', marriage:'已婚', crowd:'', address:'济南市历下区甸柳新村二区4号楼', archNo:'370102JM26031', region:'甸柳社区', createDate:'2024-10-08', dutyDoc:'陆柳琳', lock:'未上锁' },
    { org:'济南市历下区千佛山社区卫生服务中心', name:'万秀琴', idcard:'370103195505214824', idType:'居民身份证', gender:'女', age:71, phone:'15165374029', birth:'1955-05-21', marriage:'丧偶', crowd:'老', address:'济南市历下区文化东路88号', archNo:'370102JM26033', region:'文化东路社区', createDate:'2024-11-02', dutyDoc:'李蕾', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'尹桂芳', idcard:'370102196610154826', idType:'居民身份证', gender:'女', age:59, phone:'15066651730', birth:'1966-10-15', marriage:'离异', crowd:'', address:'济南市天桥区工人新村北街7号', archNo:'370105JM26035', region:'工人新村社区', createDate:'2024-11-28', dutyDoc:'王盛', lock:'未上锁' },
    { org:'济南市市中区舜玉路社区卫生服务中心', name:'华凤英', idcard:'370102195808304420', idType:'居民身份证', gender:'女', age:68, phone:'15562588107', birth:'1958-08-30', marriage:'已婚', crowd:'老,特', address:'济南市市中区玉函路39号', archNo:'370103JM26037', region:'舜玉社区', createDate:'2024-12-23', dutyDoc:'敖鹏天', lock:'未上锁' },
    { org:'济南市天桥区工人新村社区卫生服务中心', name:'汤玉珍', idcard:'370103195111234426', idType:'居民身份证', gender:'女', age:74, phone:'15589917860', birth:'1951-11-23', marriage:'丧偶', crowd:'老', address:'济南市天桥区济泺路130号', archNo:'370105JM26039', region:'工人新村社区', createDate:'2025-01-19', dutyDoc:'朱劲松', lock:'未上锁' }
  ];'''

content = content.replace(old_data, new_data)

# 同步修改 renderTable 中的数据源引用
content = content.replace('hypertensionData.filter', 'womenData.filter')
content = content.replace('lastList = hypertensionData.filter', 'lastList = womenData.filter')

# ========== 7. renderTable 函数替换 ==========
old_render = '''  function renderTable() {
    var org = $('fOrg').value, name = $('fName').value.trim(), idcard = $('fIdcard').value.trim();
    var region = $('fRegion').value, lock = $('fLock').value;
    var rStatus = $('fRStatus').value, mStatus = $('fMStatus').value;
    var grade = $('fGrade').value, hpType = $('fHpType').value, grid = $('fGrid').value;
    var phone = $('fPhone').value.trim(), archNo = $('fArchNo').value.trim();
    var gender = $('fGender').value, address = $('fAddress').value.trim();
    var specDoc = $('fSpecDoc').value.trim();
    var fullOp = $('fFullOp').value, fullVal = $('fFullVal').value.trim();
    var birthStart = $('fBirthStart').value, birthEnd = $('fBirthEnd').value;
    var specStart = $('fSpecStart').value, specEnd = $('fSpecEnd').value;

    lastList = womenData.filter(function (r) {
      if (org && r.org !== org) return false;
      if (name && r.name.indexOf(name) === -1) return false;
      if (idcard && r.idcard.indexOf(idcard) === -1) return false;
      if (region && r.region !== region) return false;
      if (lock && r.lock !== lock) return false;
      if (rStatus && r.rStatus !== rStatus) return false;
      if (mStatus && r.mStatus !== mStatus) return false;
      if (grade && r.grade !== grade) return false;
      if (hpType && r.hpType !== hpType) return false;
      if (grid && r.grid !== grid) return false;
      if (phone && r.phone.indexOf(phone) === -1) return false;
      if (archNo && r.archNo.indexOf(archNo) === -1) return false;
      if (gender && r.gender !== gender) return false;
      if (address && r.address.indexOf(address) === -1) return false;
      if (specDoc && r.specDoc.indexOf(specDoc) === -1) return false;
      if (birthStart && r.birth < birthStart) return false;
      if (birthEnd && r.birth > birthEnd) return false;
      if (specStart && r.specDate < specStart) return false;
      if (specEnd && r.specDate > specEnd) return false;
      if (bpApplied.length) {
        var bpRes = null;
        bpApplied.forEach(function (c, i) {
          var m = bpMatchRow(r, c);
          bpRes = i === 0 ? m : (c.logic === '或' ? (bpRes || m) : (bpRes && m));
        });
        if (!bpRes) return false;
      }
      if (fullOp && fullVal !== '') {
        var v = parseInt(fullVal, 10);
        if (!isNaN(v)) {
          if (fullOp === '≥' && r.full < v) return false;
          if (fullOp === '≤' && r.full > v) return false;
          if (fullOp === '＝' && r.full !== v) return false;
        }
      }
      return true;
    });

    var total = Math.max(1, Math.ceil(lastList.length / PAGE_SIZE));
    if (curPage > total) curPage = total;
    var start = (curPage - 1) * PAGE_SIZE;
    var slice = lastList.slice(start, start + PAGE_SIZE);

    var gradeCls = { '一级': 'g1', '二级': 'g2', '三级': 'g3' };
    var html = '';
    if (slice.length === 0) {
      html = '<tr class="empty-row"><td colspan="22"><div class="ico">📭</div>暂无符合条件的高血压管理档案</td></tr>';
    } else {
      slice.forEach(function (r, i) {
        var bpLv = (r.sbp >= 180 || r.dbp >= 110) ? 'lv3' : (r.sbp >= 160 || r.dbp >= 100) ? 'lv2' : 'lv1';
        var fullCls = r.full >= 90 ? 'full-ok' : r.full >= 60 ? 'full-mid' : 'full-low';
        var rsDot = r.rStatus === '正常' ? 'ok' : 'warn';
        var msDot = r.mStatus === '有效管理' ? 'info' : 'warn';
        var lkDot = r.lock === '未上锁' ? 'ok' : 'warn';
        html += '<tr>'
          + '<td class="center">' + (start + i + 1) + '</td>'
          + '<td title="' + esc(r.org) + '"><span class="cell">' + esc(r.org) + '</span></td>'
          + '<td><a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')" title="查看高血压专项档案">' + esc(r.name) + '</a></td>'
          + '<td title="' + esc(r.idcard) + '"><span class="cell">' + esc(r.idcard) + '</span></td>'
          + '<td>' + esc(r.idType) + '</td>'
          + '<td class="center"><span class="grade-badge ' + gradeCls[r.grade] + '">' + esc(r.grade) + '</span></td>'
          + '<td class="center" title="收缩压/舒张压（mmHg）"><span class="bp-val ' + bpLv + '">' + r.sbp + '/' + r.dbp + '</span></td>'
          + '<td>' + esc(r.hpType) + '</td>'
          + '<td class="center">' + esc(r.gender) + '</td>'
          + '<td class="center">' + r.age + '</td>'
          + '<td title="' + esc(r.phone) + '"><span class="cell">' + esc(r.phone) + '</span></td>'
          + '<td>' + esc(r.birth) + '</td>'
          + '<td title="' + esc(r.address) + '"><span class="cell">' + esc(r.address) + '</span></td>'
          + '<td title="' + esc(r.archNo) + '"><span class="cell">' + esc(r.archNo) + '</span></td>'
          + '<td>' + esc(r.region) + '</td>'
          + '<td>' + esc(r.specDate) + '</td>'
          + '<td>' + esc(r.specDoc) + '</td>'
          + '<td class="center"><span class="' + fullCls + '">' + r.full + '</span></td>'
          + '<td><span class="st-dot ' + rsDot + '"></span>' + esc(r.rStatus) + '</td>'
          + '<td><span class="st-dot ' + msDot + '"></span>' + esc(r.mStatus) + '</td>'
          + '<td><span class="st-dot ' + lkDot + '"></span>' + esc(r.lock) + '</td>'
          + '<td class="center">'
          +   '<a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')">查看</a>'
          +   '<span class="op-gap"></span>'
          +   '<a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')">编辑</a>'
          +   '<span class="op-gap"></span>'
          +   '<span class="op-more">'
          +     '<a class="more-btn" onclick="toggleOpMenu(this,event)">更多<svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="6 9 12 15 18 9"/></svg></a>'
          +     '<span class="op-menu">'
          +       '<button class="mi" onclick="opAction(\'随访记录\',\'' + esc(r.name) + '\')">随访记录</button>'
          +       '<button class="mi" onclick="opAction(\'血压上报\',\'' + esc(r.name) + '\')">血压上报</button>'
          +       '<button class="mi" onclick="opAction(\'打印专项档案\',\'' + esc(r.name) + '\')">打印专项档案</button>'
          +     '</span>'
          +   '</span>'
          + '</td>'
          + '</tr>';
      });
    }
    $('tbBody').innerHTML = html;
    $('pgTotal').textContent = lastList.length;
    renderPager(total);
    $('pgJump').value = curPage;
  }'''

new_render = '''  function renderTable() {
    var org = $('fOrg').value, name = $('fName').value.trim(), idcard = $('fIdcard').value.trim();
    var region = $('fRegion').value, lock = $('fLock').value;
    var marriage = $('fMarriage').value, crowd = $('fCrowd').value;
    var phone = $('fPhone').value.trim(), archNo = $('fArchNo').value.trim();
    var address = $('fAddress').value.trim(), dutyDoc = $('fDutyDoc').value.trim();
    var archStatus = $('fArchStatus').value;
    var birthStart = $('fBirthStart').value, birthEnd = $('fBirthEnd').value;
    var createStart = $('fCreateStart').value, createEnd = $('fCreateEnd').value;

    lastList = womenData.filter(function (r) {
      if (org && r.org !== org) return false;
      if (name && r.name.indexOf(name) === -1) return false;
      if (idcard && r.idcard.indexOf(idcard) === -1) return false;
      if (region && r.region !== region) return false;
      if (lock && r.lock !== lock) return false;
      if (marriage && r.marriage !== marriage) return false;
      if (crowd && (!r.crowd || r.crowd.indexOf(crowd) === -1)) return false;
      if (phone && r.phone.indexOf(phone) === -1) return false;
      if (archNo && r.archNo.indexOf(archNo) === -1) return false;
      if (address && r.address.indexOf(address) === -1) return false;
      if (dutyDoc && r.dutyDoc.indexOf(dutyDoc) === -1) return false;
      if (archStatus && r.archStatus !== archStatus) return false;
      if (birthStart && r.birth < birthStart) return false;
      if (birthEnd && r.birth > birthEnd) return false;
      if (createStart && r.createDate < createStart) return false;
      if (createEnd && r.createDate > createEnd) return false;
      return true;
    });

    var total = Math.max(1, Math.ceil(lastList.length / PAGE_SIZE));
    if (curPage > total) curPage = total;
    var start = (curPage - 1) * PAGE_SIZE;
    var slice = lastList.slice(start, start + PAGE_SIZE);

    var crowdMap = { '孕':'yun', '残':'can', '低':'di', '特':'te', '精':'jing', '结':'jie', '老':'lao' };
    var crowdLabel = { '孕':'孕', '残':'残', '低':'低', '特':'特', '精':'精', '结':'结', '老':'老' };
    var html = '';
    if (slice.length === 0) {
      html = '<tr class="empty-row"><td colspan="18"><div class="ico">📭</div>暂无符合条件的妇女管理档案</td></tr>';
    } else {
      slice.forEach(function (r, i) {
        var lkDot = r.lock === '未上锁' ? 'ok' : 'warn';
        var crowdHtml = '';
        if (r.crowd) {
          r.crowd.split(',').forEach(function(c) {
            if (crowdMap[c]) {
              crowdHtml += '<span class="crowd-tag ' + crowdMap[c] + '">' + crowdLabel[c] + '</span>';
            }
          });
        }
        html += '<tr>'
          + '<td class="center">' + (start + i + 1) + '</td>'
          + '<td title="' + esc(r.org) + '"><span class="cell">' + esc(r.org) + '</span></td>'
          + '<td><a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')" title="查看妇女档案">' + esc(r.name) + '</a></td>'
          + '<td title="' + esc(r.idcard) + '"><span class="cell">' + esc(r.idcard) + '</span></td>'
          + '<td>' + esc(r.idType) + '</td>'
          + '<td class="center">' + esc(r.gender) + '</td>'
          + '<td class="center">' + r.age + '</td>'
          + '<td>' + esc(r.birth) + '</td>'
          + '<td>' + esc(r.marriage || '') + '</td>'
          + '<td><span class="crowd-tags">' + crowdHtml + '</span></td>'
          + '<td title="' + esc(r.phone) + '"><span class="cell">' + esc(r.phone) + '</span></td>'
          + '<td title="' + esc(r.address) + '"><span class="cell">' + esc(r.address) + '</span></td>'
          + '<td title="' + esc(r.archNo) + '"><span class="cell">' + esc(r.archNo) + '</span></td>'
          + '<td>' + esc(r.region) + '</td>'
          + '<td>' + esc(r.createDate) + '</td>'
          + '<td>' + esc(r.dutyDoc) + '</td>'
          + '<td><span class="st-dot ' + lkDot + '"></span>' + esc(r.lock) + '</td>'
          + '<td class="center">'
          +   '<a class="op-link" onclick="goArchive(\'' + esc(r.archNo) + '\')">编辑</a>'
          +   '<span class="op-gap"></span>'
          +   '<span class="op-more">'
          +     '<a class="more-btn" onclick="toggleOpMenu(this,event)">新建服务<svg viewBox="0 0 24 24" style="width:10px;height:10px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round"><polyline points="6 9 12 15 18 9"/></svg></a>'
          +     '<span class="op-menu">'
          +       '<button class="mi" onclick="opAction(\'产前随访\',\'' + esc(r.name) + '\')">产前随访</button>'
          +       '<button class="mi" onclick="opAction(\'产后访视\',\'' + esc(r.name) + '\')">产后访视</button>'
          +       '<button class="mi" onclick="opAction(\'产后42天检查\',\'' + esc(r.name) + '\')">产后42天检查</button>'
          +       '<button class="mi" onclick="opAction(\'妇女病普查\',\'' + esc(r.name) + '\')">妇女病普查</button>'
          +     '</span>'
          +   '</span>'
          +   '<span class="op-gap"></span>'
          +   '<a class="op-link" style="color:#FF4D4F" onclick="opAction(\'注销\',\'' + esc(r.name) + '\')">注销</a>'
          + '</td>'
          + '</tr>';
      });
    }
    $('tbBody').innerHTML = html;
    $('pgTotal').textContent = lastList.length;
    renderPager(total);
    $('pgJump').value = curPage;
  }'''

content = content.replace(old_render, new_render)

# ========== 8. 弹框标题替换 ==========
content = content.replace('新建高血压专项</h3>', '新建妇女档案</h3>')
content = content.replace('高血压专项档案详情</h3>', '妇女档案详情</h3>')
content = content.replace('编辑高血压专项档案</h3>', '编辑妇女档案</h3>')
content = content.replace('查看高血压专项档案', '查看妇女档案')
content = content.replace('打印高血压专项档案', '打印妇女档案')

# 详情弹框内容简化
content = content.replace('当前分级', '婚姻状况')
content = content.replace('高血压类型', '重点人群类型')
content = content.replace('血压（mmHg）', '联系电话')
content = content.replace('专项建档时间', '建档日期')
content = content.replace('专项建档医生', '责任医生')
content = content.replace('专项档案完整度', '个人档案情况')
content = content.replace('居民状态', '个人档案情况')
content = content.replace('管理状态', '管辖行政区')

# 编辑弹框字段映射
content = content.replace('血压（收缩压/舒张压）', '婚姻状况')
content = content.replace('高血压类型', '重点人群类型')

# 体检项目弹框（血压项目）—— 妇女管理不需要，但保留结构并改名
content = content.replace('体检项目复合筛选', '服务类型筛选')
content = content.replace('血压项目', '服务类型')

# ========== 9. 其他函数中的文本替换 ==========
content = content.replace('暂无符合条件的高血压管理档案', '暂无符合条件的妇女管理档案')
content = content.replace('高血压管理档案', '妇女管理档案')
content = content.replace('的高血压专项档案', '的妇女档案')
content = content.replace('高血压专项', '妇女档案')

# 档案选择弹框
content = content.replace('选择居民档案（高血压专项）', '选择居民档案（妇女档案）')
content = content.replace('请选择要新建高血压专项的居民档案', '请选择要新建妇女档案的居民档案')

# 分页 toast
content = content.replace('「高血压管理」页', '「妇女管理」页')

# 随访管理标签 toast
content = content.replace('「随访管理」功能建设中', '「产前随访」功能建设中')
content = content.replace('「血压上报」功能建设中', '「产后访视」功能建设中')
content = content.replace('「分级评估」功能建设中', '「妇女病普查」功能建设中')
content = content.replace('「健康宣教」功能建设中', '「健康宣教」功能建设中')

# 导出
content = content.replace('导出高血压管理列表', '导出妇女管理列表')

# ========== 10. 去掉血压项目相关全局变量和函数（保留骨架避免引用错误） ==========
# bpApplied 数组保留但清空逻辑
content = content.replace('var bpApplied = [];', 'var bpApplied = []; /* 妇女管理：未使用血压筛选 */')

# 去掉 openBpPanel 等函数的实质内容，保留空函数避免报错
# 由于替换复杂，保留原函数但内部改为 toast

# 简化 resetFilter：保留兼容字段清空
old_reset = '''  function resetFilter() {
    $('fOrg').value = ''; $('fName').value = ''; $('fIdcard').value = '';
    $('fRegion').value = ''; $('fLock').value = '未上锁';
    $('fRStatus').value = '正常'; $('fMStatus').value = '有效管理';
    $('fGrade').value = ''; $('fHpType').value = ''; $('fGrid').value = '';
    $('fPhone').value = ''; $('fArchNo').value = '';
    $('fGender').value = ''; $('fAddress').value = '';
    $('fSpecDoc').value = '';
    $('fFullOp').value = ''; $('fFullVal').value = '';
    $('fBirthStart').value = ''; $('fBirthEnd').value = '';
    $('fSpecStart').value = ''; $('fSpecEnd').value = '';
    $('fArchStart').value = ''; $('fArchEnd').value = '';
    $('fArchDoc').value = '';
    $('fResidentType').value = '';
    $('fLiveType').value = '';
    $('fMine').checked = false;
    var radios = document.querySelectorAll('input[name="fYearEval"],input[name="fDrug"]');
    for (var i = 0; i < radios.length; i++) radios[i].checked = false;
    bpApplied = []; $('fBpItem').value = '';
    curPage = 1; renderTable();
  }'''

new_reset = '''  function resetFilter() {
    $('fOrg').value = ''; $('fName').value = ''; $('fIdcard').value = '';
    $('fRegion').value = ''; $('fLock').value = '';
    $('fMarriage').value = ''; $('fCrowd').value = '';
    $('fPhone').value = ''; $('fArchNo').value = '';
    $('fAddress').value = ''; $('fDutyDoc').value = '';
    $('fArchStatus').value = '';
    $('fBirthStart').value = ''; $('fBirthEnd').value = '';
    $('fCreateStart').value = ''; $('fCreateEnd').value = '';
    curPage = 1; renderTable();
  }'''

content = content.replace(old_reset, new_reset)

# ========== 11. 写入文件 ==========
with open(DST, 'w', encoding='utf-8') as f:
    f.write(content)

print('妇女管理.html 生成成功！')
print('文件大小:', len(content), '字节')
