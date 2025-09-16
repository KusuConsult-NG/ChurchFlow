export default function ApprovalRibbon({ agency }:{ agency?:boolean }){
  const steps = agency
    ? ['Agency','CEL','Secretary','Senior Minister','Finance']
    : ['Secretary','Senior Minister','Finance'];
  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      {steps.map((s,i)=> (
        <span key={s} className="px-2 py-1 rounded-full border">
          {s}{i<steps.length-1 ? ' →' : ''}
        </span>
      ))}
    </div>
  );
}
