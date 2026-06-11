import React, { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Loader2, Trash2, Pencil, Eye, FileText, X, RotateCcw,
  ArrowUp, ArrowDown, ArrowUpDown, Search, Settings2, Upload
} from "lucide-react";
import { useConfirm } from "@/components/context/ConfirmDialogContext";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY_PREFIX = "qual_assign_mgr_prefs_";

const ALL_COLUMNS = [
  { key: "employee_name", label: "שם העובד", alwaysVisible: true },
  { key: "department", label: "מחלקה" },
  { key: "position", label: "תפקיד" },
  { key: "status", label: "סטטוס" },
  { key: "issue_date", label: "תאריך הנפקה" },
  { key: "expiry_date", label: "תאריך תפוגה" },
  { key: "days_until_expiry", label: "ימים לתפוגה" },
  { key: "certificate_number", label: "מספר תעודה" },
  { key: "issuing_authority", label: "גוף מסמיך" },
  { key: "files", label: "מסמכים" },
  { key: "notes", label: "הערות" },
  { key: "actions", label: "פעולות", alwaysVisible: true },
];

const DEFAULT_VISIBLE = [
  "employee_name", "department", "position", "status",
  "issue_date", "expiry_date", "days_until_expiry",
  "certificate_number", "files", "actions"
];

const STATUS_COLORS = {
  "בתוקף": "bg-green-500/20 text-green-400 border-green-500/30",
  "פג תוקף": "bg-red-500/20 text-red-400 border-red-500/30",
  "עומד לפוג": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "ממתין לביצוע": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "לא רלוונטי": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function getExpiryStatus(expiryDate) {
  if (!expiryDate) return null;
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return "פג תוקף";
  if (days <= 30) return "עומד לפוג";
  return "בתוקף";
}

function SortIcon({ direction }) {
  if (!direction) return <ArrowUpDown className="w-3 h-3 text-gray-500" />;
  return direction === "asc"
    ? <ArrowUp className="w-3 h-3 text-blue-400" />
    : <ArrowDown className="w-3 h-3 text-blue-400" />;
}

export default function QualificationAssignmentManager({ qualification, open, onClose }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const storageKey = STORAGE_KEY_PREFIX + (qualification?.id || "default");
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey + "_cols")) || DEFAULT_VISIBLE; }
    catch { return DEFAULT_VISIBLE; }
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterExpiry, setFilterExpiry] = useState("all");
  const [sortKey, setSortKey] = useState("employee_name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    localStorage.setItem(storageKey + "_cols", JSON.stringify(visibleColumns));
  }, [visibleColumns, storageKey]);

  // ── טעינת נתונים ──────────────────────────────────────────────────────────

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-active"],
    queryFn: () => base44.entities.Employee.filter({ employment_status: "פעיל" }),
    initialData: [],
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions-list"],
    queryFn: () => base44.entities.Position.list(),
    initialData: [],
  });

  // הסרנו את תלות employees מכאן — הפילטר יהיה ב-useMemo
  const { data: rawAssignments = [], isLoading } = useQuery({
    queryKey: ["qualification-assignments", qualification?.id],
    queryFn: async () => {
      if (!qualification?.id) return [];
      return base44.entities.QualificationAssignment.filter({ qualification_id: qualification.id });
    },
    enabled: !!qualification?.id,
  });

  // ── מיפויים ───────────────────────────────────────────────────────────────

  const positionMap = useMemo(() => {
    const m = new Map();
    positions.forEach(p => m.set(p.id, p.name));
    return m;
  }, [positions]);

  const employeeMap = useMemo(() => {
    const m = new Map();
    employees.forEach(e => m.set(e.id, e));
    return m;
  }, [employees]);

  // ── הכנת שורות — הפילטר לעובדים פעילים + העשרת מחלקה/תפקיד ──────────────
  // תלות ב-employees, employeeMap, positionMap → יחשב מחדש כשהם נטענים
  const assignments = useMemo(() => {
    const activeIds = new Set(employees.map(e => e.id));
    return rawAssignments
      .filter(a => activeIds.has(a.employee_id))
      .map(a => {
        const emp = employeeMap.get(a.employee_id);
        const department =
          emp?.department_name || emp?.department || a.department || "-";
        const position =
          (emp?.position_ids?.length > 0
            ? emp.position_ids.map(id => positionMap.get(id)).filter(Boolean).join(", ")
            : emp?.position) || a.position || "-";
        const expiryStatus = a.expiry_date
          ? getExpiryStatus(a.expiry_date)
          : a.status || "ממתין לביצוע";
        return { ...a, department, position, expiryStatus };
      });
  }, [rawAssignments, employees, employeeMap, positionMap]);

  // ── ערכים ייחודיים לפילטרים ───────────────────────────────────────────────

  const uniqueDepartments = useMemo(
    () => [...new Set(assignments.map(a => a.department).filter(d => d && d !== "-"))],
    [assignments]
  );
  const uniqueStatuses = useMemo(
    () => [...new Set(assignments.map(a => a.expiryStatus).filter(Boolean))],
    [assignments]
  );

  // ── פילטר + חיפוש + מיון ─────────────────────────────────────────────────

  const filteredAssignments = useMemo(() => {
    let result = assignments;

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        (a.employee_name || "").toLowerCase().includes(s) ||
        (a.department || "").toLowerCase().includes(s) ||
        (a.position || "").toLowerCase().includes(s) ||
        (a.certificate_number || "").toLowerCase().includes(s) ||
        (a.issuing_authority || "").toLowerCase().includes(s) ||
        (a.notes || "").toLowerCase().includes(s)
      );
    }

    if (filterStatus !== "all")
      result = result.filter(a => a.expiryStatus === filterStatus);
    if (filterDepartment !== "all")
      result = result.filter(a => a.department === filterDepartment);
    if (filterExpiry === "expiring30")
      result = result.filter(a => {
        if (!a.expiry_date) return false;
        const d = differenceInDays(parseISO(a.expiry_date), new Date());
        return d >= 0 && d <= 30;
      });
    if (filterExpiry === "expired")
      result = result.filter(a =>
        a.expiry_date && differenceInDays(parseISO(a.expiry_date), new Date()) < 0
      );
    if (filterExpiry === "noDate")
      result = result.filter(a => !a.expiry_date);

    result = [...result].sort((a, b) => {
      let av = a[sortKey] || "";
      let bv = b[sortKey] || "";
      if (sortKey === "days_until_expiry") {
        av = a.expiry_date ? differenceInDays(parseISO(a.expiry_date), new Date()) : 9999;
        bv = b.expiry_date ? differenceInDays(parseISO(b.expiry_date), new Date()) : 9999;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [assignments, search, filterStatus, filterDepartment, filterExpiry, sortKey, sortDir]);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ── מוטיישנים ─────────────────────────────────────────────────────────────

  const excludeMutation = useMutation({
    mutationFn: id => base44.entities.QualificationAssignment.update(id, { is_active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualification-assignments", qualification?.id] });
      toast({ title: "העובד הוחרג מהשלד", className: "bg-green-500/20 border-green-500/30 text-white" });
    },
  });

  const reinstateMutation = useMutation({
    mutationFn: id => base44.entities.QualificationAssignment.update(id, { is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualification-assignments", qualification?.id] });
      toast({ title: "ההחרגה בוטלה", className: "bg-green-500/20 border-green-500/30 text-white" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QualificationAssignment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualification-assignments", qualification?.id] });
      toast({ title: "השיוך עודכן בהצלחה", className: "bg-green-500/20 border-green-500/30 text-white" });
      setEditingAssignment(null);
    },
  });

  // ── עריכה ────────────────────────────────────────────────────────────────

  const handleEdit = assignment => {
    const existing =
      assignment.file_objects?.length > 0
        ? assignment.file_objects
        : assignment.file_urls?.length > 0
        ? assignment.file_urls
        : assignment.file_url
        ? [assignment.file_url]
        : [];
    const normalized = existing.map(f =>
      typeof f === "string" ? { url: f, name: "קובץ" } : f
    );
    setEditingAssignment({
      ...assignment,
      qualification_name: assignment.qualification_name || "",
      issuing_authority: assignment.issuing_authority || "",
      issue_date: assignment.issue_date || "",
      expiry_date: assignment.expiry_date || "",
      certificate_number: assignment.certificate_number || "",
      notes: assignment.notes || "",
      file_objects: normalized,
    });
  };

  const handleFileUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditingAssignment(prev => ({
        ...prev,
        file_objects: [...(prev.file_objects || []), { url: file_url, name: file.name }],
      }));
      toast({ title: `הקובץ "${file.name}" הועלה בהצלחה`, className: "bg-green-500/20 border-green-500/30 text-white" });
    } catch {
      toast({ title: "שגיאה בהעלאת הקובץ", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSaveEdit = () => {
    if (!editingAssignment) return;
    const fileObjects = editingAssignment.file_objects || [];
    updateMutation.mutate({
      id: editingAssignment.id,
      data: {
        qualification_name: editingAssignment.qualification_name,
        issue_date: editingAssignment.issue_date,
        expiry_date: editingAssignment.expiry_date,
        certificate_number: editingAssignment.certificate_number,
        issuing_authority: editingAssignment.issuing_authority,
        notes: editingAssignment.notes,
        file_url: fileObjects[0]?.url || "",
        file_urls: fileObjects.map(f => f.url),
        file_objects: fileObjects,
      },
    });
  };

  const handleDelete = async assignment => {
    if (
      await confirm({
        title: "החרגת עובד מהשלד",
        description: `האם להחריג את ${assignment.employee_name} מהסמכה זו?`,
        variant: "destructive",
        confirmText: "החרג",
      })
    ) {
      excludeMutation.mutate(assignment.id);
    }
  };

  // ── עזרים ─────────────────────────────────────────────────────────────────

  const getFileName = (fileItem, index) => {
    if (typeof fileItem === "object" && fileItem.name && fileItem.name !== "קובץ")
      return fileItem.name;
    if (typeof fileItem === "string") {
      const parts = fileItem.split("/");
      const last = parts[parts.length - 1];
      if (last && last.length > 3) return decodeURIComponent(last);
    }
    return `קובץ ${index + 1}`;
  };

  const getFileUrl = fileItem =>
    typeof fileItem === "object" ? fileItem.url : fileItem;

  const getAssignmentFiles = assignment => {
    if (assignment.file_objects?.length > 0) return assignment.file_objects;
    if (assignment.file_urls?.length > 0) return assignment.file_urls;
    if (assignment.file_url) return [assignment.file_url];
    return [];
  };

  const isVisible = key => visibleColumns.includes(key);

  const sortableKeys = [
    "employee_name", "department", "position", "status",
    "issue_date", "expiry_date", "days_until_expiry",
    "certificate_number", "issuing_authority",
  ];

  // ── רינדור ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1A1F2E] border-[#1E293B] text-white max-w-7xl max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        <DialogHeader className="border-b border-[#1E293B] pb-4 shrink-0">
          <DialogTitle className="text-xl font-bold">
            ניהול שיוכים — {qualification?.qualification_name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {filteredAssignments.length} עובדים מוצגים
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {editingAssignment ? (
            /* ── טופס עריכה ──────────────────────────────────────────────── */
            <div className="overflow-auto flex-1 py-4">
              <div className="space-y-4 p-4 bg-[#0A0E1A] rounded-lg border border-[#1E293B]">
                <h3 className="text-white font-semibold">
                  עריכת שיוך — {editingAssignment.employee_name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "שם ההסמכה", field: "qualification_name" },
                    { label: "גוף מסמיך", field: "issuing_authority" },
                    { label: "תאריך הנפקה", field: "issue_date", type: "date" },
                    { label: "תאריך תפוגה", field: "expiry_date", type: "date" },
                    { label: "מספר תעודה", field: "certificate_number" },
                    { label: "הערות", field: "notes" },
                  ].map(({ label, field, type = "text" }) => (
                    <div key={field}>
                      <Label className="text-gray-400 text-sm">{label}</Label>
                      <Input
                        type={type}
                        value={editingAssignment[field]}
                        onChange={e =>
                          setEditingAssignment({ ...editingAssignment, [field]: e.target.value })
                        }
                        className="bg-[#1A1F2E] border-[#1E293B] text-white mt-1"
                      />
                    </div>
                  ))}
                </div>

                {/* מסמכים */}
                <div>
                  <Label className="text-gray-400 text-sm">מסמכים מצורפים</Label>
                  <div className="mt-2 space-y-2">
                    {(editingAssignment.file_objects || []).map((fileItem, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-[#1A1F2E] p-2 rounded border border-[#1E293B]"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-sm text-white truncate">
                            {getFileName(fileItem, i)}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => window.open(getFileUrl(fileItem), "_blank")}
                            className="text-blue-400 hover:text-blue-300 h-7 w-7 p-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() =>
                              setEditingAssignment({
                                ...editingAssignment,
                                file_objects: editingAssignment.file_objects.filter((_, idx) => idx !== i),
                              })
                            }
                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <input
                      type="file" ref={fileInputRef} className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline" size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="border-[#1E293B] text-gray-300 hover:bg-[#1A1F2E] gap-2"
                    >
                      {uploadingFile
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Upload className="w-4 h-4" />}
                      {uploadingFile ? "מעלה..." : "הוסף קובץ"}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateMutation.isPending ? "שומר..." : "שמור"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAssignment(null)}
                    className="border-[#1E293B] text-gray-400"
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── כלי סינון ───────────────────────────────────────────── */}
              <div className="shrink-0 py-3 space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="חיפוש חופשי (שם, מחלקה, תפקיד, מספר תעודה...)"
                      className="bg-[#0A0E1A] border-[#1E293B] text-white pr-9"
                    />
                  </div>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="bg-[#0A0E1A] border-[#1E293B] text-white w-40">
                      <SelectValue placeholder="כל המחלקות" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#1E293B]">
                      <SelectItem value="all">כל המחלקות</SelectItem>
                      {uniqueDepartments.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-[#0A0E1A] border-[#1E293B] text-white w-40">
                      <SelectValue placeholder="כל הסטטוסים" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#1E293B]">
                      <SelectItem value="all">כל הסטטוסים</SelectItem>
                      {uniqueStatuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterExpiry} onValueChange={setFilterExpiry}>
                    <SelectTrigger className="bg-[#0A0E1A] border-[#1E293B] text-white w-44">
                      <SelectValue placeholder="כל תאריכי תפוגה" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F2E] border-[#1E293B]">
                      <SelectItem value="all">כל תאריכי תפוגה</SelectItem>
                      <SelectItem value="expiring30">פג תוקף תוך 30 יום</SelectItem>
                      <SelectItem value="expired">פג תוקף</SelectItem>
                      <SelectItem value="noDate">ללא תאריך</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline" size="sm"
                    onClick={() => setShowColumnSettings(v => !v)}
                    className={`border-[#1E293B] gap-2 ${showColumnSettings ? "text-blue-400 border-blue-500/50" : "text-gray-400"}`}
                  >
                    <Settings2 className="w-4 h-4" />
                    עמודות
                  </Button>

                  {(search || filterStatus !== "all" || filterDepartment !== "all" || filterExpiry !== "all") && (
                    <Button
                      variant="ghost" size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        setSearch("");
                        setFilterStatus("all");
                        setFilterDepartment("all");
                        setFilterExpiry("all");
                      }}
                    >
                      <X className="w-4 h-4 ml-1" /> נקה
                    </Button>
                  )}
                </div>

                {/* בחירת עמודות */}
                {showColumnSettings && (
                  <div className="bg-[#0A0E1A] border border-[#1E293B] rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">בחר עמודות להצגה (נשמר אוטומטית)</p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_COLUMNS.filter(c => !c.alwaysVisible).map(col => (
                        <button
                          key={col.key}
                          onClick={() =>
                            setVisibleColumns(prev =>
                              prev.includes(col.key)
                                ? prev.filter(k => k !== col.key)
                                : [...prev, col.key]
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            visibleColumns.includes(col.key)
                              ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                              : "bg-[#1A1F2E] border-[#1E293B] text-gray-400"
                          }`}
                        >
                          {col.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── טבלה ────────────────────────────────────────────────── */}
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">לא נמצאו עובדים</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[#0A0E1A] sticky top-0 z-10">
                      <tr className="border-b border-[#1E293B]">
                        {ALL_COLUMNS.filter(c => isVisible(c.key)).map(col => (
                          <th
                            key={col.key}
                            className={`text-right text-gray-300 px-3 py-2 font-medium whitespace-nowrap ${
                              sortableKeys.includes(col.key) ? "cursor-pointer hover:text-white select-none" : ""
                            }`}
                            onClick={() => sortableKeys.includes(col.key) && handleSort(col.key)}
                          >
                            <div className="flex items-center gap-1 justify-end">
                              {col.label}
                              {sortableKeys.includes(col.key) && (
                                <SortIcon direction={sortKey === col.key ? sortDir : null} />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map(assignment => {
                        const isExcluded = assignment.is_active === false;
                        const files = getAssignmentFiles(assignment);
                        const daysLeft = assignment.expiry_date
                          ? differenceInDays(parseISO(assignment.expiry_date), new Date())
                          : null;
                        const statusLabel = assignment.expiryStatus || assignment.status || "ממתין לביצוע";
                        const statusClass = STATUS_COLORS[statusLabel] || "bg-gray-500/20 text-gray-400 border-gray-500/30";

                        return (
                          <tr
                            key={assignment.id}
                            className={`border-b border-[#1E293B] hover:bg-[#0A0E1A] transition-colors ${isExcluded ? "opacity-50" : ""}`}
                          >
                            {isVisible("employee_name") && (
                              <td className="px-3 py-2 font-medium text-white whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {assignment.employee_name}
                                  {isExcluded && (
                                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border text-xs">
                                      הוחרג
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            )}
                            {isVisible("department") && (
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {assignment.department}
                              </td>
                            )}
                            {isVisible("position") && (
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {assignment.position}
                              </td>
                            )}
                            {isVisible("status") && (
                              <td className="px-3 py-2">
                                <Badge className={`${statusClass} border text-xs whitespace-nowrap`}>
                                  {statusLabel}
                                </Badge>
                              </td>
                            )}
                            {isVisible("issue_date") && (
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {assignment.issue_date
                                  ? format(parseISO(assignment.issue_date), "dd/MM/yyyy")
                                  : "-"}
                              </td>
                            )}
                            {isVisible("expiry_date") && (
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {assignment.expiry_date
                                  ? format(parseISO(assignment.expiry_date), "dd/MM/yyyy")
                                  : "-"}
                              </td>
                            )}
                            {isVisible("days_until_expiry") && (
                              <td className="px-3 py-2 whitespace-nowrap">
                                {daysLeft === null ? (
                                  <span className="text-gray-500">-</span>
                                ) : daysLeft < 0 ? (
                                  <span className="text-red-400">פג ({Math.abs(daysLeft)} ימים)</span>
                                ) : daysLeft <= 30 ? (
                                  <span className="text-yellow-400">{daysLeft} ימים</span>
                                ) : (
                                  <span className="text-green-400">{daysLeft} ימים</span>
                                )}
                              </td>
                            )}
                            {isVisible("certificate_number") && (
                              <td className="px-3 py-2 text-gray-300">
                                {assignment.certificate_number || "-"}
                              </td>
                            )}
                            {isVisible("issuing_authority") && (
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {assignment.issuing_authority || "-"}
                              </td>
                            )}
                            {isVisible("files") && (
                              <td className="px-3 py-2">
                                {files.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {files.map((f, i) => (
                                      <button
                                        key={i}
                                        onClick={() => window.open(getFileUrl(f), "_blank")}
                                        title={getFileName(f, i)}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 text-xs transition-colors"
                                      >
                                        <FileText className="w-3 h-3 shrink-0" />
                                        <span className="max-w-[100px] truncate">{getFileName(f, i)}</span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-xs">אין מסמך</span>
                                )}
                              </td>
                            )}
                            {isVisible("notes") && (
                              <td className="px-3 py-2 text-gray-300 max-w-[150px]">
                                <span className="truncate block" title={assignment.notes}>
                                  {assignment.notes || "-"}
                                </span>
                              </td>
                            )}
                            {isVisible("actions") && (
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  {isExcluded ? (
                                    <Button
                                      variant="ghost" size="sm"
                                      onClick={() => reinstateMutation.mutate(assignment.id)}
                                      className="text-green-400 hover:text-green-300 h-8 w-8 p-0"
                                      title="בטל החרגה"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="ghost" size="sm"
                                        onClick={() => handleEdit(assignment)}
                                        className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"
                                        title="ערוך"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost" size="sm"
                                        onClick={() => handleDelete(assignment)}
                                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                                        title="החרג"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#1E293B] shrink-0">
          <span className="text-xs text-gray-500">
            {filteredAssignments.length} מתוך {assignments.length} עובדים
          </span>
          <Button
            onClick={onClose}
            className="bg-[#0A0E1A] hover:bg-[#1E293B] text-white border border-[#1E293B]"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
