<template>
<div>
  <div class="task" v-if="!this.$route.params.id">
    <el-container>
      <el-header style="padding: 0px;display:flex;justify-content:space-between;align-items: center">
        <div style="display: inline">
          <el-input placeholder="名称搜索" clearable @change="keywordsChange" style="width: 300px;margin: 0px;padding: 0px;" 
            size="mini" @keyup.enter.native="searchTask" prefix-icon="el-icon-search" v-model="keywords">
          </el-input>
          <el-button type="primary" size="mini" style="margin-left: 5px" icon="el-icon-search" @click="searchTask">搜索
          </el-button>
        </div>
        <div style="margin-left: 5px;margin-right: 20px;display: inline">
          <el-upload :show-file-list="false" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" action="http://127.0.0.1:8081/tbtool/task/importTasks" :data="tokenContainer"
            :on-success="fileUploadSuccess" :on-error="fileUploadError" :disabled="fileUploadBtnText=='正在导入'"
            :before-upload="beforeFileUpload" style="display: inline" :multiple='true' :limit="1" :with-credentials='true'>
            <el-button size="mini" type="success" :loading="fileUploadBtnText=='正在导入'">
              <i class="fa fa-lg fa-level-up" style="margin-right: 5px"></i>{{fileUploadBtnText}}
            </el-button>
          </el-upload>
          <el-button type="success" size="mini" @click="exportTasks">
            <i class="fa fa-lg fa-level-down" style="margin-right: 5px"></i>导出数据
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="showAddTaskView">添加任务</el-button>
        </div>
      </el-header>
      <el-main>
        <div>
          <el-table :data="tasks" border stripe v-loading="tableLoading" @selection-change="handleSelectionChange" element-loading-text="拼命加载中..."
                    style="width: 100%" height="443">
            <el-table-column type="selection" align="left" width="30"></el-table-column>        
            <el-table-column prop="taskName" label="任务名" align="left"></el-table-column>
            <el-table-column prop="recieverName" label="任务接收人" align="left"></el-table-column>
            <!--
            <el-table-column label="状态" align="left">
              <template slot-scope="scope">未发布</template>
            </el-table-column>
            -->
            <el-table-column label="状态" align="left" >
              <template slot-scope="scope">
                <span v-if="scope.row.status === 0" :class="'not-published'">未发布</span>
                <span v-if="scope.row.status === 1" :class="'is-assigned'">已发布</span>
                <span v-if="scope.row.status === 2" :class="'is-complished'">已完成</span>
                <span v-if="scope.row.status === 3" :class="'is-abandoned'">已废弃</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="goToDetailPage(scope.row)">进入详情</el-button>
                <el-button type="success" size="mini" @click="showUpdTaskView(scope.row)">编辑</el-button>
                <el-button type="danger" size="mini" @click="delTask(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
           
          <div style="display: flex;justify-content: space-between;margin: 2px">
            <div>
              <el-button type="danger" size="mini" v-if="tasks.length>0" :disabled="multipleSelection.length == 0"
                @click="delManyTasks">批量删除
              </el-button>
              <el-button type="primary" size="mini" v-if="tasks.length>0" :disabled="multipleSelection.length != 1"
                @click="publishTask">发布
              </el-button>
              <el-button type="primary" size="mini" v-if="tasks.length>0" :disabled="multipleSelection.length != 1"
                @click="abandonTask">废弃
              </el-button>
            </div>
            <el-pagination
              background
              :page-size="1"
              :current-page="currentPage"
              @current-change="currentChange"
              layout="prev, pager, next"
              :total="totalPages">
            </el-pagination>
          </div>
        </div>
      </el-main> 
    </el-container>

    <!-- 数据编辑或者新增模块 -->
    <el-form :model="task" :rules="rules" ref="addTaskForm" style="margin: 0px;padding: 0px;">
      <div style="text-align: left;">
        <el-dialog :title="dialogTitle" style="padding: 0px;" :close-on-click-modal="false" :visible.sync="dialogVisible" width="77%">
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="任务名称:" prop="taskName">
                <el-input prefix-icon="el-icon-edit" v-model="task.taskName" size="mini" style="width: 500px"
                          placeholder="请输入任务名"></el-input>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <div style="margin: 0 atuo;">
              <el-form-item label="任务接收人:" prop="recieverName">
                <el-select v-model="task.recieverId" placeholder="请选择">
                  <el-option v-for="(item,index) in recievers" :key="index" :label="item.userName" :value="item.id">
                  </el-option>
                </el-select>          
              </el-form-item>
            </div>
          </el-row>
          
          <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="cancelEidt">取 消</el-button>
            <el-button size="mini" type="primary" @click="addTask('addTaskForm')">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-form>
  </div>
  <router-view></router-view>
</div>
</template>

<script>
export default {
  name: 'Task',
  data () {
    return {
      tableLoading: false,
      fileUploadBtnText: '导入数据',
      tasks: [],
      recieverId: '',
      recievers: [],
      totalPages: -1,
      currentPage: 1,
      showSize: 5,
      keywords: '',
      dialogTitle: '',
      dialogVisible: false,
      multipleSelection: [],
      task: {
          id: '',
          taskName: '',
          creatorId: '',
          creatorName: '',
          recieverId: '',
          recieverName: '',
          minCustomerNum: 0,
          realCustomerNum: 0,
          status: 0,
          createTime: '',
      },
      rules: {
        taskName: [{required: true, message: '必填:任务名称', trigger: 'blur'}],
      },
      tokenContainer: {
        token: '',
      },
    }
  },
  mounted: function() {
    this.initData();
  },
  computed: {
    
  },
  methods: {
    initData() {
      var _this = this;
      this.tableLoading = true;
      this.constructReqData({}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.tasks = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
      this.tokenContainer.token = this.storageManager.getToken();
    },
    emptyTaskData() {
      this.tasks = [];
      this.totalPages = -1;
    },
    cancelEidt() {
      this.dialogVisible = false;
    },
    addTask(formName) {
      var _this = this;
      
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let url;
          if (this.task.id) {
            url = 'http://127.0.0.1:8081/tbtool/task/update';
          } else {
            url = 'http://127.0.0.1:8081/tbtool/task/save';
          }
          this.tableLoading = true;
          this.constructReqData(this.task).then((reqData) => {
            this.postRequest(url, reqData).then(resp=> {
            _this.tableLoading = false;
            if(resp && resp.status == 200) {
              var data = resp.data;
              if('0000' === data.code) {
                // 成功
                _this.$message({ type: 'info', message: data.message });
                _this.dialogVisible = false;
                _this.emptyTaskData();
                _this.loadTasks();
              } else {
                // 失败
                _this.$message({ type: 'error', message: data.message });
              }
            }});
          });
        } else {
          return false;
        }
      });
    },
    getStatusInfo(row, column) {
      console.log(row, column);
      if(row.status === 0) {
        return '<span class="not-published">未发布</span>';
      } else if(row.status === 1) {
        return '已发布';
      } else if(row.status === 2) {
        return '已完成';
      } else if(row.status === 3) {
        return '已废弃';
      }
    },
    delTask(row) {
      this.$confirm('此操作将永久删除[' + row.taskName + '], 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.doDelete(row.id);
      }).catch(() => {
      });
    },
    delManyTasks() {
      this.$confirm('此操作将删除[' + this.multipleSelection.length + ']条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var ids = '';
        for (var i = 0; i < this.multipleSelection.length; i++) {
          if(i !== 0) {
            ids += ',';
          }
          ids += this.multipleSelection[i].id;
        }
        this.doDelete(ids);
      }).catch(() => {
      });
    },
    doDelete(ids){
      this.tableLoading = true;
      var _this = this;
      this.constructReqData({ ids: ids }).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/del', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            if('0000' === data.code) {
              _this.$message({type: 'success', message: data.message});
              _this.loadTasks();
            } else {
              _this.$message({type: 'error', message: data.message});
            }
          }
        });
      });
    },
    showUpdTaskView(row) {
      var _this = this;
      this.dialogTitle = "编辑任务";
      this.task.id = row.id;
      this.task.taskName = row.taskName;
      this.task.recieverId = row.recieverId;
      this.task.recieverName = row.recieverName;
      this.task.status = row.status;
      this.dialogVisible = true;
      if(this.recievers || this.recievers.length === 0) {
        this.constructReqData({}).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          if (resp && resp.status == 200) {
            _this.recievers = resp.data.content.list;
          }
        });
      });
      }
    },
    currentChange(currentChange){
      this.currentPage = currentChange;
      this.loadTasks();
    },
    emptyTaskrData() {
      this.task = {
          id: '',
          taskName: '',
          creatorId: '',
          creatorName: '',
          recieverId: '',
          recieverName: '',
          minCustomerNum: 0,
          realCustomerNum: 0,
          status: 0,
          createTime: '',
      }; 
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    loadTasks(){
      var _this = this;
      this.tableLoading = true;
      this.constructReqData({name: this.keywords}, this.currentPage, this.showSize).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/list', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            _this.tasks = data.content.list;
            _this.totalPages = data.content.pageSize;
          }
        });
      });
    },
    searchTask(){
      this.loadTasks();
    },
    showAddTaskView(){
      var _this = this;
      if(this.recievers || this.recievers.length === 0) {
        this.constructReqData({}).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/user/list', reqData).then(resp=> {
          if (resp && resp.status == 200) {
            _this.recievers = resp.data.content.list;
            this.dialogTitle = "添加任务";
            this.dialogVisible = true;
          }
        });
      });
      }
    },
    keywordsChange(val) {
      if (val == '') {
        this.loadTasks();
      }
    },
    
    beforeFileUpload(file){
      this.fileUploadBtnText = '正在导入';
    },
    fileUploadSuccess(response, file, fileList){
      if (response) {
        this.$message({type: response.status, message: response.msg});
      }
      this.loadTasks();
      this.fileUploadBtnText = '导入数据';
    },
    fileUploadError(err, file, fileList){
      this.$message({type: 'error', message: "导入失败!"});
      this.fileUploadBtnText = '导入数据';
    },
    exportTasks() {
      alert('此功能待完善中...');
    },
    goToDetailPage(detail) {
      console.log(this.$router);
      this.$router.push(`/home/task/${detail.id}`);
    },
    publishTask() {
      this.$confirm('确定要发布[' + this.multipleSelection[0].taskName + ']吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用任务发布接口
        this.doPublishTask(this.multipleSelection[0]);
      }).catch(() => {
      });
    },
    abandonTask() {
      this.$confirm('确定要废弃[' + this.multipleSelection[0].taskName + ']吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用废弃任务
        this.doAbandonTask(this.multipleSelection[0]);
      }).catch(() => {
      });
    },
    doPublishTask(task) {
      this.tableLoading = true;
      var _this = this;
      this.constructReqData({ ids: ids }).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/publish', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            if('0000' === data.code) {
              _this.$message({type: 'success', message: data.message});
              _this.loadTasks();
            } else {
              _this.$message({type: 'error', message: data.message});
            }
          }
        });
      });
    },
    doAbandonTask(task) {
      this.tableLoading = true;
      var _this = this;
      this.constructReqData({ id: task.id }).then(reqData => {
        _this.postRequest('http://127.0.0.1:8081/tbtool/task/abandon', reqData).then(resp=> {
          _this.tableLoading = false;
          if (resp && resp.status == 200) {
            var data = resp.data;
            if('0000' === data.code) {
              _this.$message({type: 'success', message: data.message});
              _this.loadTasks();
            } else {
              _this.$message({type: 'error', message: data.message});
            }
          }
        });
      });
    },
  }
}
</script>

<style>
.not-published {
  color: #FF3333;
}

.is-assigned {
  color: #3333FF;
}

.is-complished {
  color: #33FF33;
}

.is-abandoned {
  
}
</style>