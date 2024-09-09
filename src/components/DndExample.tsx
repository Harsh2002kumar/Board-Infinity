'use client';

import { cardsData } from '@/bin/CardsData';
import { useEffect, useState } from 'react';
import { Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
// import LoadingSkeleton from "./LoadingSkeleton";
import { DndContext } from '@/context/DndContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { title } from 'process';
import { Badge } from './ui/badge';

interface Cards {
  id: number;
  title: string;
  description: string;
  components: {
    id: number;
    name: string;
    description?: string; // Add description property if it doesn't exist
    date: string;
    status: string;
    priority: string;
  }[];
}

const TaskDetailsPopup: React.FC<{
  task: Cards['components'][0];
  onClose: () => void;
  onEdit: (
    taskId: number,
    editedName: string,
    editedDescription: string
  ) => void;
  onDelete: (taskId: number) => void;
}> = ({ task, onClose, onEdit, onDelete }) => {
  const [editedName, setEditedName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(
    task.description || ''
  );

  const handleSave = () => {
    onEdit(task.id, editedName, editedDescription);
    onClose();
  };

  return (
    <div className="task-details-popup bg-white text-black w-1/4 mx-auto p-3 rounded-md">
      <h2 className="text-center">{`Task Name - ${editedName} / Task id -${task.id}`}</h2>

      <hr />

      <div className="p-3">
        <div className="my-2 flex gap-2  justify-between">
          <label>Name:</label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="border-2 rounded-md text-center text-gray-400"
          />
        </div>
        <div className="my-2 flex justify-between gap-2 items-center">
          <label>Description:</label>
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="border-2 rounded-md "
          />
        </div>
      </div>

      <hr />
      <div className="flex justify-evenly mt-2">
        <button
          className="bg-gradient-to-l from-lime-400 to-green-300 p-1 rounded-lg"
          onClick={handleSave}
        >
          Save Changes
        </button>
        <button
          className="bg-gradient-to-l from-rose-400 to-rose-600 p-1 rounded-lg"
          onClick={() => onDelete(task.id)}
        >
          Delete Task
        </button>
        <button
          className="bg-gradient-to-r from-neutral-300 to-stone-400 p-1 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const DndExample = () => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    date: '',
    status: '',
    priority: '',
  });

  const [data, setData] = useState<Cards[] | []>([]);
  const [selectedTask, setSelectedTask] = useState<
    Cards['components'][0] | null
  >(null);

  // Function to save data to local storage
  const saveDataToLocalStorage = (data: Cards[] | []) => {
    localStorage.setItem('dndData', JSON.stringify(data));
  };

  // Function to get data from local storage
  const getDataFromLocalStorage = () => {
    const storedData = localStorage.getItem('dndData');
    return storedData ? JSON.parse(storedData) : [];
  };

  useEffect(() => {
    // Load data from local storage when the component mounts
    const storedData = getDataFromLocalStorage();
    setData(storedData.length ? storedData : []); // Remove the default assignment to cardsData
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      const newData = [...JSON.parse(JSON.stringify(data))];
      const oldDroppableIndex = newData.findIndex(
        (x) => x.id == source.droppableId.split('droppable')[1]
      );
      const newDroppableIndex = newData.findIndex(
        (x) => x.id == destination.droppableId.split('droppable')[1]
      );
      const [item] = newData[oldDroppableIndex].components.splice(
        source.index,
        1
      );
      newData[newDroppableIndex].components.splice(destination.index, 0, item);
      setData([...newData]);
      saveDataToLocalStorage(newData); // Move this line inside the if block
    } else {
      const newData = [...JSON.parse(JSON.stringify(data))];
      const droppableIndex = newData.findIndex(
        (x) => x.id == source.droppableId.split('droppable')[1]
      );
      const [item] = newData[droppableIndex].components.splice(source.index, 1);
      newData[droppableIndex].components.splice(destination.index, 0, item);
      setData([...newData]);
      saveDataToLocalStorage(newData); // Move this line inside the else block
    }
  };

  useEffect(() => {
    // Load data from local storage when the component mounts
    const storedData = getDataFromLocalStorage();
    setData(storedData.length ? storedData : cardsData);
  }, []); // Empty dependency array ensures it runs only once on mount

  useEffect(() => {}, []);

  //   if (!data.length) {
  //     return <LoadingSkeleton />;
  //   }

  const handleAddTask = async (containerIndex: number) => {
    const newData = [...JSON.parse(JSON.stringify(data))];

    const taskTitle = prompt('Enter the task title:');
    const taskDescription = prompt('Enter the task description:');

    if (taskTitle) {
      const newTask = {
        id: Math.floor(Math.random() * 1000),
        name: taskTitle,
        description: taskDescription || '',
        date: new Date().toLocaleDateString(),
      };

      newData[containerIndex].components.push(newTask);
      setData([...newData]);
    }
    saveDataToLocalStorage(newData);
  };

  const handleTaskClick = (task: Cards['components'][0]) => {
    setSelectedTask(task);
  };

  const handleEditTask = (
    taskId: number,
    editedName: string,
    editedDescription: string
  ) => {
    const newData = data.map((group) => ({
      ...group,
      components: group.components.map((task) =>
        task.id === taskId
          ? { ...task, name: editedName, description: editedDescription }
          : task
      ),
    }));
    setData(newData);
    saveDataToLocalStorage(newData);
    setSelectedTask(null); // Close the pop-up after editing
  };

  const handleDeleteTask = (taskId: number) => {
    const newData = data.map((group) => ({
      ...group,
      components: group.components.filter((task) => task.id !== taskId),
    }));
    setData(newData);
    saveDataToLocalStorage(newData);
    setSelectedTask(null); // Close the pop-up after deletion
  };

  // const handleAddTask = async (containerIndex: number) => {
  //   const newData = [...JSON.parse(JSON.stringify(data))];

  //   const taskTitle = prompt("Enter the task title:");

  //   if (taskTitle) {
  //     const newTask = {
  //       id: Math.floor(Math.random() * 1000),
  //       name: taskTitle,
  //     };

  //     newData[containerIndex].components.push(newTask);
  //     setData([...newData]);
  //     saveDataToLocalStorage(newData);
  //   }
  // };

  const handleInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    containerIndex: number
  ) => {
    if (e.key === 'Enter') {
      const taskTitle = e.currentTarget.value;

      if (taskTitle) {
        const newData = [...JSON.parse(JSON.stringify(data))];
        const newTask = {
          id: Math.floor(Math.random() * 1000),
          name: taskTitle,
        };

        newData[containerIndex].components.push(newTask);
        setData([...newData]);
        saveDataToLocalStorage(newData);

        // Clear the input field
        e.currentTarget.value = '';
      }
    }
  };

  const addTask = () => {
    const newData = [...JSON.parse(JSON.stringify(data))];

    if (
      task.title === '' ||
      task.description === '' ||
      task.date === '' ||
      task.status === '' ||
      task.priority === ''
    ) {
      alert('Please fill all the fields');
    }

    const newTask = {
      id: Math.floor(Math.random() * 1000),
      name: task.title,
      description: task.description,
      date: task.date,
      priority: task.priority,
    };

    newData[Number(task.status)].components.push(newTask);
    setData([...newData]);

    saveDataToLocalStorage(newData);

    setTask({
      title: '',
      description: '',
      date: '',
      status: '',
      priority: '',
    });
  };

  return (
    <>
      <div className="flex items-center  px-5 mt-4 md:py-2 w-full justify-between max-w-7xl mx-auto">
        <p className=" text-black text-2xl">
          {/* <UserCircleIcon className='inline-block w-10 h-10 mr-1 text-gray-950'/> */}
          Desktop & Mobile Application
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <button
              className="rounded px-2 py-2 bg-purple-500 text-white"
              // onClick={() => handleAddTask(0)}
            >
              <p className="text-sm font-light text-white">Create Task</p>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 w-full">
              <div className="grid w-full  items-center gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  id="title"
                  type="text"
                />
              </div>
              <div className="grid w-full  items-center gap-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  value={task.description}
                  onChange={(e) =>
                    setTask({ ...task, description: e.target.value })
                  }
                  rows={4}
                  name="description"
                  id="description"
                  className="border-2 rounded-md "
                ></textarea>
              </div>

              <div className="grid w-full  items-center gap-1.5">
                <Label htmlFor="date">Select Date</Label>
                <Input
                  value={task.date}
                  onChange={(e) => setTask({ ...task, date: e.target.value })}
                  id="date"
                  type="date"
                />
              </div>
              <div className="grid w-full  items-center gap-1.5">
                <Label htmlFor="date">Status</Label>
                <Select
                  onValueChange={(value) => {
                    setTask({ ...task, status: value });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Todo</SelectItem>
                    <SelectItem value="1">In Progress</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full  items-center gap-1.5">
                <Label htmlFor="Priority">Priority</Label>
                <Select
                  onValueChange={(value) => {
                    setTask({ ...task, priority: value });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="ml-auto flex gap-4 ">
              <Button
                variant={'outline'}
                className="border border-purple-500 text-purple-500"
              >
                Cancel
              </Button>

              <Button
                variant={'default'}
                className="bg-purple-500 hover:bg-purple-700 text-white"
                onClick={() => addTask()}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DndContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 justify-between my-3 px-4 flex-col lg:flex-row py-3 mb-3 max-w-7xl mx-auto">
          {data.map((val, index) => {
            return (
              <Droppable key={index} droppableId={`droppable${index}`}>
                {(provided) => (
                  <div
                    className="p-0.5 lg:w-1/3 w-full rounded-md bg-white text-black shadow-lg shadow-gray-600  border-black bottom-2 border "
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <div
                      className={`cardnav flex justify-center text-white  p-2 m-1
                        ${
                          val.title === 'TODO'
                            ? 'bg-purple-500'
                            : val.title === 'IN PROGRESS'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }
                      
                      `}
                    >
                      <p className="rounded-md text-center">{val.title}</p>
                    </div>

                    {val.components?.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className=" rounded-lg  mx-1 px-4 py-3 my-3 border"
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            // onClick={() => handleTaskClick(component)}
                          >
                            <Badge
                              className={`
                                  ${
                                    component.priority == 'LOW'
                                      ? 'bg-green-300'
                                      : component.priority == 'MEDIUM'
                                      ? 'bg-red-400'
                                      : 'bg-orange-400'
                                  }

                                  bg-opacity-75
                                  `}
                            >
                              {component.priority}
                            </Badge>

                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger>
                                  {component.name}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <p
                                    className="text-sm text-gray-800 my-1"
                                    style={{ whiteSpace: 'pre-wrap' }}
                                  >
                                    {component.description}
                                  </p>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <hr />
                            <p className="text-xs text-gray-400 mt-2">
                              {component.date}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>

        {selectedTask && (
          <TaskDetailsPopup
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
      </DndContext>
    </>
  );
};

export default DndExample;
