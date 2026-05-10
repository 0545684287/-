'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { hrApi } from '@/lib/api'
import { X } from 'lucide-react'

const STEPS = ['פרטים אישיים', 'פרטי תעסוקה', 'איש קשר לחירום']

export function AddEmployeeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(0)
  const { register, handleSubmit, formState: { errors }, getValues } = useForm()

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrApi.getDepartments().then((r: any) => r.data),
  })

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => hrApi.getEmployees({ limit: 1 }).then(() => [] as any[]),
  })

  const mutation = useMutation({
    mutationFn: (data: any) => hrApi.createEmployee(data),
    onSuccess,
  })

  const onSubmit = (data: any) => {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return }
    mutation.mutate(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">הוספת עובד חדש</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        {/* Steps */}
        <div className="flex px-6 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${i <= step ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="שם פרטי *" error={errors.firstName?.message as string}>
                    <input {...register('firstName', { required: 'חובה' })} className={inputCls} />
                  </Field>
                  <Field label="שם משפחה *" error={errors.lastName?.message as string}>
                    <input {...register('lastName', { required: 'חובה' })} className={inputCls} />
                  </Field>
                </div>
                <Field label="אימייל *" error={errors.email?.message as string}>
                  <input {...register('email', { required: 'חובה', pattern: { value: /\S+@\S+\.\S+/, message: 'אימייל לא תקין' } })} type="email" className={inputCls} dir="ltr" />
                </Field>
                <Field label="טלפון">
                  <input {...register('phone')} type="tel" className={inputCls} dir="ltr" />
                </Field>
                <Field label="תעודת זהות">
                  <input {...register('nationalId')} className={inputCls} />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="מחלקה *" error={errors.departmentId?.message as string}>
                  <select {...register('departmentId', { required: 'חובה' })} className={inputCls}>
                    <option value="">בחר מחלקה</option>
                    {(departments || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="תפקיד *" error={errors.positionId?.message as string}>
                  <input {...register('positionId', { required: 'חובה' })} className={inputCls} placeholder="מזהה תפקיד" />
                </Field>
                <Field label="תאריך תחילת עבודה *" error={errors.startDate?.message as string}>
                  <input {...register('startDate', { required: 'חובה' })} type="date" className={inputCls} />
                </Field>
                <Field label="סוג העסקה *">
                  <select {...register('contractType', { required: true })} className={inputCls}>
                    <option value="permanent">קבוע</option>
                    <option value="temporary">זמני</option>
                    <option value="contractor">קבלן</option>
                  </select>
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-gray-500 mb-2">איש קשר לחירום (לא חובה)</p>
                <Field label="שם">
                  <input {...register('emergencyContact.name')} className={inputCls} />
                </Field>
                <Field label="טלפון">
                  <input {...register('emergencyContact.phone')} type="tel" className={inputCls} dir="ltr" />
                </Field>
                <Field label="קשר">
                  <input {...register('emergencyContact.relationship')} className={inputCls} placeholder="בן/בת זוג, הורה..." />
                </Field>
              </>
            )}
          </div>

          {mutation.isError && (
            <p className="px-6 text-sm text-red-600">אירעה שגיאה. ייתכן שהאימייל כבר קיים.</p>
          )}

          <div className="flex items-center justify-between p-5 border-t border-gray-100">
            <button type="button" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
              {step === 0 ? 'ביטול' : 'הקודם'}
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-60">
              {mutation.isPending ? 'שומר...' : step < STEPS.length - 1 ? 'הבא' : 'שמור עובד'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
