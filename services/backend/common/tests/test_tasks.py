import datetime
import json

import pytest

from config import settings
from ..tasks import Task

pytestmark = pytest.mark.django_db


class TestScheduledTasks:
    def test_apply_task_entry(self, task_apply):
        task = Task(name='test-task', source='test-source', event_bus_name=settings.WORKERS_EVENT_BUS_NAME)
        task_data = {'test_param': 'test-value'}

        task.apply(task_data)

        task_apply.assert_task_applied(source='test-source', detail_type='test-task', data=task_data)

    def test_schedule_task_entry(self, task_apply):
        task = Task(name='test-task', source='test-source', event_bus_name=settings.WORKERS_EVENT_BUS_NAME)
        task_data = {'test_param': 'test-value'}
        due_date = datetime.datetime.now()

        task.apply(task_data, due_date=due_date)

        called_entry_kwarg = task_apply.call_args.kwargs['entry']
        called_entry_kwarg_data = json.loads(called_entry_kwarg['Detail'])
        called_wrapped_entry = called_entry_kwarg_data['entry']
        called_wrapped_entry_data = json.loads(called_entry_kwarg_data['entry']['Detail'])

        assert called_entry_kwarg['Source'] == 'backend.scheduler'
        assert called_entry_kwarg['DetailType'] == 'backend.scheduler'
        assert called_entry_kwarg_data['type'] == 'backend.scheduler'
        assert called_wrapped_entry['Source'] == 'test-source'
        assert called_wrapped_entry_data['type'] == 'test-task'
        assert called_wrapped_entry_data['test_param'] == 'test-value'
