from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def init_scheduler(app):
    from .tasks import test_task

    def task_wrapper():
        with app.app_context():
            test_task()

    scheduler.add_job(
        task_wrapper,
        trigger="cron",
        minute="*",
        max_instances=1
    )

    if not app.config["TESTING"]:
        scheduler.start()

        import atexit
        atexit.register(lambda: scheduler.shutdown())
