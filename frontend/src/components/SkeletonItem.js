import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonCard = styled.div`
  background-color: #eee;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin: 20px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const SkeletonImage = styled.div`
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2.5s infinite linear;
`;

const SkeletonBody = styled.div`
  padding: 20px;
  flex: 1;
`;

const SkeletonText = styled.div`
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2.5s infinite linear;
  margin-bottom: 10px;
`;

const SkeletonButton = styled.div`
  width: 100px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2.5s infinite linear;
  border-radius: 4px;
  margin: 10px 0;
`;

const SkeletonItem = () => (
  <div className="col d-flex align-items-stretch">
    <SkeletonCard className="card h-100 d-flex flex-column">
      <SkeletonImage />
      <SkeletonBody>
        <SkeletonText />
        <SkeletonText />
        <SkeletonText />
      </SkeletonBody>
      <div className="mt-auto p-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </SkeletonCard>
  </div>
);

export default SkeletonItem;
