package tasks

func StartTasks() {
	go mcServerStatusesTask()
	go ycServerStatusTask()
}
