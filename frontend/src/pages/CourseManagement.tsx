import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BookOpen, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_OPTIONS } from "@/lib/constants";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  enrolled: number;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(String(CATEGORY_OPTIONS[0].id));

  useEffect(() => {
    const raw = localStorage.getItem("institution_courses");
    if (raw) {
      setCourses(JSON.parse(raw));
    } else {
      // Mock initial data
      const initial = [
        { id: "c1", title: "Introduction to Blockchain", description: "Learn the fundamentals of blockchain.", category: "2", enrolled: 120 },
        { id: "c2", title: "Advanced React Patterns", description: "Master modern React development.", category: "1", enrolled: 85 }
      ];
      setCourses(initial);
      localStorage.setItem("institution_courses", JSON.stringify(initial));
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      enrolled: 0
    };
    
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem("institution_courses", JSON.stringify(updated));
    
    // Reset
    setTitle("");
    setDescription("");
    setCategory(String(CATEGORY_OPTIONS[0].id));
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem("institution_courses", JSON.stringify(updated));
  };

  return (
    <DashboardLayout userType="institution">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Manage the courses offered by your institution.
            </p>
          </div>
          <Button variant="gradient" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" />
            {isAdding ? "Cancel" : "Add Course"}
          </Button>
        </div>

        {isAdding && (
          <div className="p-6 rounded-2xl bg-card border border-border animate-in fade-in slide-in-from-top-4">
            <h2 className="font-display text-lg font-semibold mb-4">Create New Course</h2>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Intro to Data Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Brief description of the course" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat">Category</Label>
                <select
                    id="cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {CATEGORY_OPTIONS.map(({ id, name }) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
              </div>
              <Button type="submit" className="w-full sm:w-auto">Save Course</Button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center space-y-3 bg-card border border-border rounded-2xl">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
              <div className="text-muted-foreground">No courses available. Click 'Add Course' to create one.</div>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="p-6 rounded-2xl bg-card border border-border flex flex-col h-full hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {CATEGORY_OPTIONS.find(c => String(c.id) === String(course.category))?.name || "Unknown"}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold mb-2 break-words">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{course.description}</p>
                <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled Students</span>
                  <span className="font-bold">{course.enrolled}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
